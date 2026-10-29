import Fuel from "../models/Fuel.js";
import Vehicle from "../models/Vehicle.js";
import { ownedQuery } from "../middleware/accessControl.js";

export async function getFuel(req, res) {
  let query = ownedQuery(req);
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    query = profile?.assignedVehicle ? { vehicle: profile.assignedVehicle } : { _id: null };
  }
  const records = await Fuel.find(query).populate("vehicle").sort({ date: -1 });
  res.json(records);
}

export async function getFuelByVehicle(req, res) {
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle || String(profile.assignedVehicle) !== String(req.params.vehicleId)) return res.status(403).json({ message: "Vehicle is not assigned to you." });
  }
  const records = await Fuel.find(req.user.role === "Driver" ? { vehicle: req.params.vehicleId } : ownedQuery(req, { vehicle: req.params.vehicleId }))
    .populate("vehicle")
    .sort({ date: -1 });
  res.json(records);
}

export async function createFuel(req, res) {
  const { vehicle, date, odometer, fuelLiters, pricePerLiter } = req.body;
  const liters = Number(fuelLiters);
  const price = Number(pricePerLiter);
  const odo = Number(odometer);

  if (!vehicle || !Number.isFinite(liters) || !Number.isFinite(price) || !Number.isFinite(odo) || liters <= 0 || price < 0 || odo < 0) {
    return res.status(400).json({ message: "vehicle, odometer, fuelLiters and pricePerLiter are required" });
  }

  let currentVehicle = await Vehicle.findOne(ownedQuery(req, { _id: vehicle }));
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle || String(profile.assignedVehicle) !== String(vehicle)) return res.status(403).json({ message: "Drivers can add fuel only for their assigned vehicle." });
    currentVehicle = await Vehicle.findById(vehicle);
  }
  if (!currentVehicle) return res.status(404).json({ message: "Vehicle not found" });
  if (odo < currentVehicle.currentKm) return res.status(400).json({ message: `Odometer must be at least ${currentVehicle.currentKm} km.` });
  const totalCost = Number((liters * price).toFixed(2));
  const record = await Fuel.create({
    vehicle,
    createdBy: req.user._id,
    date: date || new Date(),
    odometer: odo,
    fuelLiters: liters,
    pricePerLiter: price,
    totalCost
  });

  if (odo > currentVehicle.currentKm) {
    currentVehicle.currentKm = odo;
    await currentVehicle.save();
  }

  const populated = await record.populate("vehicle");
  res.status(201).json(populated);
}

export async function deleteFuel(req, res) {
  const record = await Fuel.findOneAndDelete(ownedQuery(req, { _id: req.params.id }));
  if (!record) return res.status(404).json({ message: "Fuel record not found" });
  res.json({ message: "Fuel record deleted" });
}
