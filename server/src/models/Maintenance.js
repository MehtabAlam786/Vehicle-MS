import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    date: { type: Date, default: Date.now },
    odometer: { type: Number, required: true, min: 0, max: 100000000 },
    serviceType: { type: String, required: true, trim: true },
    description: { type: String, default: "", maxlength: 2000 },
    cost: { type: Number, default: 0, min: 0, max: 100000000 },
    nextServiceKm: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Completed", "Pending"], default: "Completed" }
  },
  { timestamps: true }
);

maintenanceSchema.index({ vehicle: 1, date: -1 });

export default mongoose.model("Maintenance", maintenanceSchema);
