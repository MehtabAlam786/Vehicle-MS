import Vehicle from "../models/Vehicle.js";
import Fuel from "../models/Fuel.js";
import Maintenance from "../models/Maintenance.js";
import Driver from "../models/Driver.js";
import { ownedQuery } from "../middleware/accessControl.js";

/* ─── helpers ──────────────────────────────────────────── */
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = d => d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/* Drivers don't "own" (createdBy) any fleet records — they only see data for
   their single assigned vehicle. Every report needs this same scoping that
   the dashboard/vehicle/fuel/maintenance controllers already apply, otherwise
   a Driver's reports silently come back empty. */
async function scopedQueries(req) {
    if (req.user.role !== "Driver") {
        return {
            vehicleQuery: ownedQuery(req),
            fuelQuery: ownedQuery(req),
            maintenanceQuery: ownedQuery(req),
            driverQuery: ownedQuery(req),
        };
    }
    const profile = await Driver.findOne({ email: req.user.email }).select("assignedVehicle");
    const assignedVehicle = profile?.assignedVehicle || null;
    return {
        vehicleQuery: assignedVehicle ? { _id: assignedVehicle } : { _id: null },
        fuelQuery: assignedVehicle ? { vehicle: assignedVehicle } : { _id: null },
        maintenanceQuery: assignedVehicle ? { vehicle: assignedVehicle } : { _id: null },
        driverQuery: { email: req.user.email },
    };
}

function lastNMonths(n) {
    const months = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push({ key: monthKey(d), label: monthLabel(d), date: d });
    }
    return months;
}

/* Applies an optional ?vehicleId= filter. For a Driver, `filter.vehicle` is
   already locked to their one assigned vehicle by scopedQueries() — the query
   param must never be allowed to override that, or a Driver could request
   another vehicle's fuel/maintenance records just by changing the URL. */
function applyVehicleIdFilter(filter, vehicleId, role) {
    if (!vehicleId) return filter;
    if (role === "Driver") {
        if (String(filter.vehicle) !== String(vehicleId)) filter._id = null; // force an empty result set
        return filter;
    }
    filter.vehicle = vehicleId;
    return filter;
}

/* ─── GET /api/reports/overview ────────────────────────── */
export async function getOverview(req, res) {
    const { vehicleQuery, fuelQuery, maintenanceQuery, driverQuery } = await scopedQueries(req);
    const [vehicles, fuel, maintenance, drivers] = await Promise.all([
        Vehicle.find(vehicleQuery),
        Fuel.find(fuelQuery).populate("vehicle", "vehicleNumber vehicleName type"),
        Maintenance.find(maintenanceQuery).populate("vehicle", "vehicleNumber vehicleName type"),
        Driver.find(driverQuery),
    ]);

    const months = lastNMonths(6);

    // Monthly fuel cost + liters
    const monthlyFuel = months.map(m => {
        const records = fuel.filter(f => monthKey(new Date(f.date)) === m.key);
        return {
            month: m.label,
            cost: records.reduce((s, r) => s + r.totalCost, 0),
            liters: records.reduce((s, r) => s + r.fuelLiters, 0),
            count: records.length,
        };
    });

    // Monthly maintenance cost
    const monthlyMaintenance = months.map(m => {
        const records = maintenance.filter(r => monthKey(new Date(r.date)) === m.key);
        return {
            month: m.label,
            cost: records.reduce((s, r) => s + r.cost, 0),
            count: records.length,
        };
    });

    // Per-vehicle summary
    const vehicleSummary = vehicles.map(v => {
        const fuelRecs = fuel.filter(f => f.vehicle?._id?.toString() === v._id.toString());
        const maintRecs = maintenance.filter(m => m.vehicle?._id?.toString() === v._id.toString());
        const totalFuelCost = fuelRecs.reduce((s, r) => s + r.totalCost, 0);
        const totalFuelL = fuelRecs.reduce((s, r) => s + r.fuelLiters, 0);
        const totalMaintCost = maintRecs.reduce((s, r) => s + r.cost, 0);
        return {
            _id: v._id,
            vehicleNumber: v.vehicleNumber,
            vehicleName: v.vehicleName,
            type: v.type,
            status: v.status,
            currentKm: v.currentKm,
            fuelEntries: fuelRecs.length,
            totalFuelCost,
            totalFuelLiters: totalFuelL,
            maintEntries: maintRecs.length,
            totalMaintCost,
            totalCost: totalFuelCost + totalMaintCost,
            avgFuelEfficiency: (() => {
                const ordered = [...fuelRecs].sort((a, b) => Number(a.odometer) - Number(b.odometer));
                let distance = 0;
                for (let i = 1; i < ordered.length; i++) distance += Math.max(0, ordered[i].odometer - ordered[i - 1].odometer);
                return totalFuelL > 0 && distance > 0 ? +(distance / totalFuelL).toFixed(2) : 0;
            })(),
        };
    }).sort((a, b) => b.totalCost - a.totalCost);

    // Top expense categories
    const totalFuelCost = fuel.reduce((s, r) => s + r.totalCost, 0);
    const totalMaintCost = maintenance.reduce((s, r) => s + r.cost, 0);
    const totalCost = totalFuelCost + totalMaintCost;

    // Service type breakdown
    const serviceTypes = {};
    maintenance.forEach(m => {
        serviceTypes[m.serviceType] = (serviceTypes[m.serviceType] || 0) + m.cost;
    });
    const serviceBreakdown = Object.entries(serviceTypes)
        .map(([type, cost]) => ({ type, cost }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 8);

    // Fleet health
    const overdue = vehicles.filter(v => v.nextServiceKm - v.currentKm <= 0).length;
    const dueSoon = vehicles.filter(v => { const r = v.nextServiceKm - v.currentKm; return r > 0 && r <= 500; }).length;
    const healthy = vehicles.length - overdue - dueSoon;

    res.json({
        summary: {
            totalVehicles: vehicles.length,
            totalDrivers: drivers.length,
            totalFuelCost,
            totalMaintCost,
            totalCost,
            totalFuelLiters: fuel.reduce((s, r) => s + r.fuelLiters, 0),
            totalFuelEntries: fuel.length,
            totalMaintEntries: maintenance.length,
            avgCostPerVehicle: vehicles.length ? +(totalCost / vehicles.length).toFixed(0) : 0,
        },
        fleetHealth: { overdue, dueSoon, healthy },
        monthlyFuel,
        monthlyMaintenance,
        vehicleSummary,
        serviceBreakdown,
    });
}

/* ─── GET /api/reports/fuel ────────────────────────────── */
export async function getFuelReport(req, res) {
    const { from, to, vehicleId } = req.query;
    const { fuelQuery } = await scopedQueries(req);
    const filter = fuelQuery;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }
    applyVehicleIdFilter(filter, vehicleId, req.user.role);

    const records = await Fuel.find(filter)
        .populate("vehicle", "vehicleNumber vehicleName type")
        .sort({ date: -1 });

    const totalCost = records.reduce((s, r) => s + r.totalCost, 0);
    const totalLiters = records.reduce((s, r) => s + r.fuelLiters, 0);
    const avgPrice = records.length ? +(totalCost / totalLiters).toFixed(2) : 0;

    res.json({ records, totalCost, totalLiters, avgPrice, count: records.length });
}

/* ─── GET /api/reports/maintenance ─────────────────────── */
export async function getMaintenanceReport(req, res) {
    const { from, to, vehicleId, status } = req.query;
    const { maintenanceQuery } = await scopedQueries(req);
    const filter = maintenanceQuery;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }
    applyVehicleIdFilter(filter, vehicleId, req.user.role);
    if (status) filter.status = status;

    const records = await Maintenance.find(filter)
        .populate("vehicle", "vehicleNumber vehicleName type")
        .sort({ date: -1 });

    const totalCost = records.reduce((s, r) => s + r.cost, 0);
    const completed = records.filter(r => r.status === "Completed").length;
    const pending = records.filter(r => r.status === "Pending").length;

    res.json({ records, totalCost, completed, pending, count: records.length });
}

/* ─── GET /api/reports/vehicle/:id ─────────────────────── */
export async function getVehicleReport(req, res) {
    const { id } = req.params;
    const { vehicleQuery, fuelQuery, maintenanceQuery } = await scopedQueries(req);

    // A Driver's *Query objects already pin the record set to their one
    // assigned vehicle. Spreading `{ _id: id }` / `{ vehicle: id }` on top
    // would silently overwrite that restriction with whatever :id is in the
    // URL, letting a Driver read any other vehicle's report. Reject early
    // instead of ever building a query that could leak another vehicle.
    if (req.user.role === "Driver" && String(vehicleQuery._id) !== String(id)) {
        return res.status(404).json({ message: "Vehicle not found" });
    }

    const [vehicle, fuel, maintenance] = await Promise.all([
        Vehicle.findOne({ ...vehicleQuery, _id: id }),
        Fuel.find({ ...fuelQuery, vehicle: id }).sort({ date: -1 }),
        Maintenance.find({ ...maintenanceQuery, vehicle: id }).sort({ date: -1 }),
    ]);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({
        vehicle,
        fuel,
        maintenance,
        totals: {
            fuelCost: fuel.reduce((s, r) => s + r.totalCost, 0),
            fuelLiters: fuel.reduce((s, r) => s + r.fuelLiters, 0),
            maintCost: maintenance.reduce((s, r) => s + r.cost, 0),
        },
    });
}
