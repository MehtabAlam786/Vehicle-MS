import Maintenance from "../models/Maintenance.js";
import Vehicle from "../models/Vehicle.js";
import { ownedQuery } from "../middleware/accessControl.js";

const MAINTENANCE_FIELDS = ["vehicle", "date", "serviceType", "description", "odometer", "cost", "nextServiceKm", "status"];
const pickMaintenanceFields = (body) => Object.fromEntries(MAINTENANCE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

export async function getMaintenance(req, res) {
  let query = ownedQuery(req);
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    query = profile?.assignedVehicle ? { vehicle: profile.assignedVehicle } : { _id: null };
  }
  const records = await Maintenance.find(query).populate("vehicle").sort({ date: -1 });
  res.json(records);
}

export async function getMaintenanceByVehicle(req, res) {
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle || String(profile.assignedVehicle) !== String(req.params.vehicleId)) return res.status(403).json({ message: "Vehicle is not assigned to you." });
  }
  const records = await Maintenance.find(req.user.role === "Driver" ? { vehicle: req.params.vehicleId } : ownedQuery(req, { vehicle: req.params.vehicleId }))
    .populate("vehicle")
    .sort({ date: -1 });
  res.json(records);
}

export async function createMaintenance(req, res) {
  const { vehicle: vehicleId, odometer, nextServiceKm, cost } = req.body;
  const odo = Number(odometer);
  const nextKm = Number(nextServiceKm);
  const serviceCost = Number(cost || 0);
  if (!vehicleId || !Number.isFinite(odo) || odo < 0 || !Number.isFinite(nextKm) || nextKm < 0 || !Number.isFinite(serviceCost) || serviceCost < 0) {
    return res.status(400).json({ message: "Vehicle, odometer, next service kilometer and a valid cost are required" });
  }
  let vehicle = await Vehicle.findOne(ownedQuery(req, { _id: vehicleId }));
  if (req.user.role === "Driver") {
    const Driver = (await import("../models/Driver.js")).default;
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    if (!profile?.assignedVehicle || String(profile.assignedVehicle) !== String(vehicleId)) return res.status(403).json({ message: "Drivers can add maintenance only for their assigned vehicle." });
    vehicle = await Vehicle.findById(vehicleId);
  }
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  if (odo < vehicle.currentKm) return res.status(400).json({ message: `Odometer must be at least ${vehicle.currentKm} km.` });
  const record = await Maintenance.create({ ...pickMaintenanceFields(req.body), odometer: odo, nextServiceKm: nextKm, cost: serviceCost, createdBy: req.user._id });

  if (odo > vehicle.currentKm) vehicle.currentKm = odo;
  vehicle.nextServiceKm = nextKm;
  await vehicle.save();

  const populated = await record.populate("vehicle");
  res.status(201).json(populated);
}

export async function deleteMaintenance(req, res) {
  const record = await Maintenance.findOneAndDelete(ownedQuery(req, { _id: req.params.id }));
  if (!record) return res.status(404).json({ message: "Maintenance record not found" });
  res.json({ message: "Maintenance record deleted" });
}
