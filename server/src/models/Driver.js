import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
        employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, default: "", trim: true, lowercase: true },
        licenseNumber: { type: String, required: true, trim: true, uppercase: true },
        licenseExpiry: { type: Date, required: true },
        address: { type: String, default: "", trim: true, maxlength: 500 },
        joiningDate: { type: Date, default: Date.now },
        assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
        status: { type: String, enum: ["Active", "Inactive", "On Leave"], default: "Active" },
        experience: { type: Number, default: 0, min: 0 },   // years
        totalTrips: { type: Number, default: 0, min: 0 },
        avatar: { type: String, default: "" },           // initials fallback in UI
    },
    { timestamps: true }
);

driverSchema.index({ status: 1 });

export default mongoose.model("Driver", driverSchema);
