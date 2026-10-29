import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import {
  sendOTPEmail,
  sendRoleRequestEmail,
} from "../services/emailService.js";
import RoleRequest from "../models/RoleRequest.js";

/* ── helpers ── */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function userResponse(user, token) {
  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      accountStatus: user.accountStatus,
      theme: user.theme,
      primaryColor: user.primaryColor,
      sidebarColor: user.sidebarColor,
      compactMode: user.compactMode,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  };
}

/* ── POST /api/auth/register ── */
export async function register(req, res) {
  try {
    const { name, email, password, phone, requestedRole = "Viewer" } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const allowedRequestedRoles = ["Viewer", "Manager", "Supervisor", "Driver"];
    if (!allowedRequestedRoles.includes(requestedRole)) {
      return res.status(400).json({ message: "Invalid requested role." });
    }

    const role = "Viewer";
    const needsApproval = requestedRole !== "Viewer";
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role,
      phone: phone || "",
      accountStatus: needsApproval ? "Pending" : "Active",
    });

    if (needsApproval) {
      await RoleRequest.create({ user: user._id, requestedRole });
      try {
        const admin = await User.findOne({
          role: "Admin",
          isActive: true,
        }).select("email name");
        if (admin?.email) {
          await sendRoleRequestEmail({
            to: admin.email,
            adminName: admin.name,
            userName: user.name,
            userEmail: user.email,
            requestedRole,
          });
        }
      } catch (mailErr) {
        console.warn(
          "Role request email could not be delivered:",
          mailErr.message,
        );
      }
      return res.status(202).json({
        pendingApproval: true,
        message: `Your ${requestedRole} access request has been sent to an administrator for approval.`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
        },
      });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user._id);
    res.status(201).json(userResponse(user, token));
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Registration failed." });
  }
}

/* ── POST /api/auth/login ── */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.role === "Admin") {
      return res
        .status(403)
        .json({
          message: "Administrator accounts must sign in through /admin/login.",
        });
    }
    if (user.accountStatus === "Pending") {
      return res
        .status(403)
        .json({ message: "Your account is awaiting administrator approval." });
    }
    if (user.accountStatus === "Rejected") {
      return res
        .status(403)
        .json({
          message:
            "Your access request was rejected. Please contact an administrator.",
        });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact administrator." });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
}

/* ── GET /api/auth/me ── (protected) ── */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user." });
  }
}

/* ── PUT /api/auth/me ── update profile (protected) ── */
export async function updateMe(req, res) {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile." });
  }
}

/* ── PUT /api/auth/change-password ── (protected) ── */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password." });
  }
}

/* ── POST /api/auth/logout ── (stateless — client drops token) ── */
export async function logout(req, res) {
  res.json({ message: "Logged out successfully." });
}

/* ── POST /api/auth/forgot-password ──────────────────────────────
   Step 1: Enter email → generate OTP → deliver it out-of-band.
   In development the OTP is logged server-side only.
   ─────────────────────────────────────────────────────────────── */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    console.log("Forgot password email:", email.toLowerCase().trim());
    console.log("User found:", !!user);
    console.log("User active:", user?.isActive);

    if (!user || !user.isActive) {
      return res.json({
        message: "If the account exists, a reset code has been issued.",
        expiresIn: "15 minutes",
      });
    }

    const otp = user.createResetOTP();
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail({
      to: user.email,
      name: user.name,
      otp,
      purpose: "password-reset",
    });
    res.json({
      message: "If the account exists, a reset code has been issued.",
      expiresIn: "15 minutes",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res
      .status(500)
      .json({ message: "Failed to generate OTP.", error: err.message });
  }
}

/* ── POST /api/auth/verify-otp ───────────────────────────────────
   Step 2: Enter OTP → verify → return short-lived resetToken
   ─────────────────────────────────────────────────────────────── */
export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetOTP: hashedOTP,
      resetOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    /* Mark verified, issue short-lived reset token (10 min) */
    user.resetVerified = true;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    const resetToken = jwt.sign(
      { id: user._id, purpose: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );
    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    await user.save({ validateBeforeSave: false });

    res.json({
      message: "OTP verified. You may now reset your password.",
      resetToken,
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
}

/* ── POST /api/auth/reset-password ──────────────────────────────
   Step 3: Submit resetToken + new password
   ─────────────────────────────────────────────────────────────── */
export async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res
        .status(400)
        .json({ message: "Reset session has expired. Please start over." });
    }
    if (decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: tokenHash,
      resetVerified: true,
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or already used reset token." });
    }

    user.password = newPassword; /* pre-save hook hashes it */
    if (user.role === "Admin") user.adminMfaVerified = false;
    user.resetToken = null;
    user.resetVerified = false;
    await user.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Password reset failed." });
  }
}

/* Admin authentication: password + email OTP. Public registration can never create Admin. */
export async function adminLoginStart(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "Admin",
    });
    if (!user || !user.isActive)
      return res
        .status(401)
        .json({ message: "Invalid administrator credentials." });
    if (!(await user.matchPassword(password)))
      return res
        .status(401)
        .json({ message: "Invalid administrator credentials." });

    // First successful admin login must be verified once by email OTP.
    // After verification the account can use the normal password login flow.
    if (user.adminMfaVerified) {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return res.json({
        ...userResponse(user, signToken(user._id)),
        adminOtpRequired: false,
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    user.adminLoginOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.adminLoginOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendOTPEmail({
      to: user.email,
      name: user.name,
      otp,
      purpose: "admin-login",
    });
    res.json({
      message: "Verification code sent to the administrator email.",
      email: user.email,
      expiresIn: "10 minutes",
      adminOtpRequired: true,
    });
  } catch (err) {
    console.error("adminLoginStart error:", err);
    res
      .status(503)
      .json({
        message:
          "Unable to send the administrator verification code. Check email configuration.",
      });
  }
}

export async function adminLoginVerify(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email?.trim() || !otp?.trim())
      return res
        .status(400)
        .json({ message: "Email and verification code are required." });
    const hash = crypto.createHash("sha256").update(otp.trim()).digest("hex");
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "Admin",
      adminLoginOTP: hash,
      adminLoginOTPExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid or expired verification code." });
    user.adminLoginOTP = null;
    user.adminLoginOTPExpires = null;
    user.adminMfaVerified = true;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    res.json(userResponse(user, signToken(user._id)));
  } catch (err) {
    console.error("adminLoginVerify error:", err);
    res.status(500).json({ message: "Administrator verification failed." });
  }
}

/* One-time admin bootstrap. Disabled after the first administrator exists. */
export async function adminSetup(req, res) {
  try {
    const setupKey = process.env.ADMIN_SETUP_KEY;
    if (!setupKey || req.headers["x-admin-setup-key"] !== setupKey)
      return res.status(404).json({ message: "Not found" });
    if (await User.exists({ role: "Admin" }))
      return res
        .status(409)
        .json({ message: "An administrator already exists." });
    const { name, email, password, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      return res
        .status(400)
        .json({
          message: "Name, email and password (8+ characters) are required.",
        });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "Admin",
      phone: phone || "",
    });
    res
      .status(201)
      .json({ message: "Administrator created. Use /admin/login to sign in." });
  } catch (err) {
    console.error("adminSetup error:", err);
    res.status(500).json({ message: "Administrator setup failed." });
  }
}
