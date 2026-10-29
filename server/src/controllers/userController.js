import User from "../models/User.js";
import RoleRequest from "../models/RoleRequest.js";

const ALLOWED_ROLES = ["Admin", "Manager", "Supervisor", "Viewer", "Driver"];

export async function listRoleRequests(req, res) {
  const requests = await RoleRequest.find({ status: "Pending" }).populate("user", "name email phone role accountStatus createdAt").sort({ createdAt: -1 });
  res.json(requests);
}

export async function reviewRoleRequest(req, res) {
  const { action, reason } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ message: "Action must be approve or reject." });
  const request = await RoleRequest.findById(req.params.id).populate("user");
  if (!request) return res.status(404).json({ message: "Role request not found." });
  if (request.status !== "Pending") return res.status(409).json({ message: "This request has already been reviewed." });

  request.status = action === "approve" ? "Approved" : "Rejected";
  request.reason = String(reason || "").trim();
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  const user = request.user;
  if (action === "approve") {
    user.role = request.requestedRole;
    user.accountStatus = "Active";
    user.isActive = true;
  } else {
    user.accountStatus = "Rejected";
    user.isActive = false;
  }
  await user.save();
  res.json({ message: action === "approve" ? "Role request approved." : "Role request rejected.", request });
}

export async function listUsers(req, res) {
  const users = await User.find({}).select("-password -resetOTP -resetOTPExpires -resetToken -adminLoginOTP -adminLoginOTPExpires").sort({ createdAt: -1 });
  res.json(users);
}

export async function updateUser(req, res) {
  const { role, isActive, name, phone } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user._id.equals(req.user._id) && role && role !== "Admin") return res.status(400).json({ message: "You cannot remove your own administrator role." });
  if (role !== undefined && !ALLOWED_ROLES.includes(role)) return res.status(400).json({ message: "Invalid role" });
  if (role === "Admin" && !user._id.equals(req.user._id)) return res.status(400).json({ message: "Administrator access is created only through the secure Admin setup flow." });
  if (user._id.equals(req.user._id) && isActive === false) return res.status(400).json({ message: "You cannot deactivate your own account." });
  if (name !== undefined) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  await user.save();
  res.json({ user });
}
