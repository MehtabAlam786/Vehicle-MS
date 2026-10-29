import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ["Admin", "Manager", "Supervisor", "Driver", "Viewer"], default: "Viewer" },
        avatar: { type: String, default: "" },
        theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
        primaryColor: { type: String, default: "#3b82f6" },
        sidebarColor: { type: String, default: "#0f2747" },
        compactMode: { type: Boolean, default: false },
        phone: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        accountStatus: { type: String, enum: ["Active", "Pending", "Rejected"], default: "Active" },
        lastLogin: { type: Date, default: null },
        /* ── Password Reset ── */
        resetOTP: { type: String, default: null },   // hashed OTP
        resetOTPExpires: { type: Date, default: null },   // 15-min TTL
        resetVerified: { type: Boolean, default: false },  // step 2 unlocked
        resetToken: { type: String, default: null },
        adminLoginOTP: { type: String, default: null },
        adminLoginOTPExpires: { type: Date, default: null },
        adminMfaVerified: { type: Boolean, default: false }, // one-time first-login verification
    },
    { timestamps: true }
);

/* Hash password before save */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

/* Compare plaintext vs hash */
userSchema.methods.matchPassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

/* Generate a 6-digit OTP, store hashed, return plain */
userSchema.methods.createResetOTP = function () {
    const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits
    this.resetOTP = crypto.createHash("sha256").update(otp).digest("hex");
    this.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    this.resetVerified = false;
    this.resetToken = null;
    return otp;   // return plain to send to user
};

/* Strip sensitive fields from JSON output */
userSchema.set("toJSON", {
    transform(_, obj) {
        delete obj.password;
        delete obj.resetOTP;
        delete obj.resetOTPExpires;
        delete obj.resetToken;
        delete obj.adminLoginOTP;
        delete obj.adminLoginOTPExpires;
        delete obj.adminMfaVerified;
        return obj;
    },
});

export default mongoose.model("User", userSchema);
