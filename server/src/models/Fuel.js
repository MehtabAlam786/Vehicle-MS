import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    date: { type: Date, default: Date.now },
    odometer: { type: Number, required: true, min: 0, max: 100000000 },
    fuelLiters: { type: Number, required: true, min: 0, max: 100000 },
    pricePerLiter: { type: Number, required: true, min: 0, max: 100000 },
    totalCost: { type: Number, required: true, min: 0, max: 100000000 }
  },
  { timestamps: true }
);

fuelSchema.index({ vehicle: 1, date: -1 });

export default mongoose.model("Fuel", fuelSchema);
