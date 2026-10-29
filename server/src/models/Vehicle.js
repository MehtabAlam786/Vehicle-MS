import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    vehicleName: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: ["Car", "Bike", "Truck", "SUV", "Bus", "Other"], default: "Car" },
    owner: { type: String, default: "", maxlength: 160 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    currentKm: { type: Number, default: 0, min: 0 },
    nextServiceKm: { type: Number, default: 10000, min: 0 },
    status: { type: String, enum: ["Active", "Inactive", "In Service"], default: "Active" }
  },
  { timestamps: true }
);

vehicleSchema.virtual("serviceStatus").get(function () {
  const remaining = this.nextServiceKm - this.currentKm;
  if (remaining <= 0) return "OVERDUE";
  if (remaining <= 500) return "DUE_SOON";
  return "OK";
});

vehicleSchema.set("toJSON", { virtuals: true });

vehicleSchema.index({ status: 1 });

export default mongoose.model("Vehicle", vehicleSchema);
