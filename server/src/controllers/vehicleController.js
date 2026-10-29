import Vehicle from "../models/Vehicle.js";
import Fuel from "../models/Fuel.js";
import Maintenance from "../models/Maintenance.js";
import Driver from "../models/Driver.js";
import { ownedQuery } from "../middleware/accessControl.js";

const VEHICLE_FIELDS = ["vehicleNumber", "vehicleName", "type", "owner", "currentKm", "nextServiceKm", "status"];

function pickVehicleFields(body) {
  return Object.fromEntries(VEHICLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
}

export async function getVehicles(req, res) {
  if (req.user.role === "Driver") {
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle) return res.json([]);
    const vehicle = await Vehicle.findById(profile.assignedVehicle);
    return res.json(vehicle ? [vehicle] : []);
  }
  const vehicles = await Vehicle.find(ownedQuery(req)).sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function getVehicle(req, res) {
  let vehicle;
  if (req.user.role === "Driver") {
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle || String(profile.assignedVehicle) !== String(req.params.id)) return res.status(404).json({ message: "Vehicle not found" });
    vehicle = await Vehicle.findById(req.params.id);
  } else {
    vehicle = await Vehicle.findOne(ownedQuery(req, { _id: req.params.id }));
  }
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  res.json(vehicle);
}

export async function createVehicle(req, res) {
  const vehicle = await Vehicle.create({ ...pickVehicleFields(req.body), createdBy: req.user._id });
  res.status(201).json(vehicle);
}

export async function updateVehicle(req, res) {
  const changes = pickVehicleFields(req.body);
  if (changes.currentKm !== undefined) {
    const existing = await Vehicle.findOne(ownedQuery(req, { _id: req.params.id }));
    if (!existing) return res.status(404).json({ message: "Vehicle not found" });
    if (Number(changes.currentKm) < existing.currentKm) {
      return res.status(400).json({ message: "Odometer cannot be reduced" });
    }
  }
  const vehicle = await Vehicle.findOneAndUpdate(ownedQuery(req, { _id: req.params.id }), changes, {
    new: true,
    runValidators: true
  });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  res.json(vehicle);
}

export async function deleteVehicle(req, res) {
  const vehicle = await Vehicle.findOne(ownedQuery(req, { _id: req.params.id }));
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  const [fuelCount, maintenanceCount] = await Promise.all([
    Fuel.countDocuments({ vehicle: vehicle._id }),
    Maintenance.countDocuments({ vehicle: vehicle._id }),
  ]);
  if (fuelCount || maintenanceCount) {
    return res.status(409).json({ message: "This vehicle has fuel or maintenance records and cannot be deleted." });
  }
  await Driver.updateMany({ assignedVehicle: vehicle._id }, { $set: { assignedVehicle: null } });
  await vehicle.deleteOne();
  res.json({ message: "Vehicle deleted" });
}

export async function updateKilometer(req, res) {
  const km = Number(req.body.currentKm);
  if (!Number.isFinite(km) || km < 0) {
    return res.status(400).json({ message: "Invalid kilometer value" });
  }

  const vehicle = await Vehicle.findOne(ownedQuery(req, { _id: req.params.id }));
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  if (km < vehicle.currentKm) return res.status(400).json({ message: "Odometer cannot be reduced" });
  vehicle.currentKm = km;
  await vehicle.save();
  res.json(vehicle);
}
