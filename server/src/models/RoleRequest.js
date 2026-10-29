import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    requestedRole: { type: String, enum: ["Manager", "Supervisor", "Driver"], required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
    reason: { type: String, trim: true, maxlength: 500, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

roleRequestSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model("RoleRequest", roleRequestSchema);
