import Vehicle from "../models/Vehicle.js";
import Fuel from "../models/Fuel.js";
import Maintenance from "../models/Maintenance.js";
import Driver from "../models/Driver.js";
import { ownedQuery } from "../middleware/accessControl.js";

export async function getDashboard(req, res) {
  let vehicleQuery = ownedQuery(req);
  let fuelQuery = ownedQuery(req);
  let maintenanceQuery = ownedQuery(req);
  let driverQuery = ownedQuery(req);

  if (req.user.role === "Driver") {
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    const assignedVehicle = profile?.assignedVehicle || null;
    vehicleQuery = assignedVehicle ? { _id: assignedVehicle } : { _id: null };
    fuelQuery = assignedVehicle ? { vehicle: assignedVehicle } : { _id: null };
    maintenanceQuery = assignedVehicle ? { vehicle: assignedVehicle } : { _id: null };
    driverQuery = { email: req.user.email };
  }

  const [vehicles, fuel, maintenance, drivers] = await Promise.all([
    Vehicle.find(vehicleQuery).sort({ createdAt: -1 }),
    Fuel.find(fuelQuery).populate("vehicle").sort({ date: -1 }).limit(50),
    Maintenance.find(maintenanceQuery).populate("vehicle").sort({ date: -1 }).limit(50),
    Driver.find(driverQuery).populate("assignedVehicle", "vehicleNumber vehicleName").sort({ createdAt: -1 }),
  ]);

  const active = vehicles.filter(v => v.status === "Active").length;
  const inactive = vehicles.filter(v => v.status === "Inactive").length;
  const inService = vehicles.filter(v => v.status === "In Service").length;
  const totalFuelCost = fuel.reduce((sum, x) => sum + Number(x.totalCost || 0), 0);
  const totalFuelLiters = fuel.reduce((sum, x) => sum + Number(x.fuelLiters || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((sum, x) => sum + Number(x.cost || 0), 0);
  const serviceAlerts = vehicles.map(v => {
    const remainingKm = v.nextServiceKm - v.currentKm;
    return { ...v.toJSON(), remainingKm, serviceStatus: remainingKm <= 0 ? "OVERDUE" : remainingKm <= 500 ? "DUE_SOON" : "OK" };
  }).filter(v => v.serviceStatus !== "OK").sort((a, b) => a.remainingKm - b.remainingKm);

  res.json({
    stats: {
      totalVehicles: vehicles.length, activeVehicles: active, inactiveVehicles: inactive, inServiceVehicles: inService,
      totalFuelCost, totalFuelLiters, totalMaintenanceCost, upcomingServices: serviceAlerts.length,
      totalDrivers: drivers.length, activeDrivers: drivers.filter(d => d.status === "Active").length,
    },
    serviceAlerts, recentFuel: fuel.slice(0, 5), recentMaintenance: maintenance.slice(0, 5), recentDrivers: drivers.slice(0, 5), vehicles, drivers,
  });
}
