import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import { ownedQuery } from "../middleware/accessControl.js";

/* GET /api/drivers */
export async function getDrivers(req, res) {
    const drivers = await Driver.find(ownedQuery(req))
        .populate("assignedVehicle", "vehicleNumber vehicleName type status")
        .sort({ createdAt: -1 });
    res.json(drivers);
}

/* GET /api/drivers/:id */
export async function getDriver(req, res) {
    const driver = await Driver.findOne(ownedQuery(req, { _id: req.params.id }))
        .populate("assignedVehicle", "vehicleNumber vehicleName type status");
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
}

/* POST /api/drivers */
const DRIVER_FIELDS = ["name", "employeeId", "phone", "email", "licenseNumber", "licenseExpiry", "address", "joiningDate", "status", "experience", "totalTrips", "avatar"];
const pickDriverFields = (body) => Object.fromEntries(DRIVER_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

async function validateAssignedVehicle(req, vehicleId) {
    if (!vehicleId) return true;
    return !!(await Vehicle.findOne(ownedQuery(req, { _id: vehicleId })).select("_id"));
}

export async function createDriver(req, res) {
    const data = pickDriverFields(req.body);
    if (req.body.assignedVehicle) {
        if (!(await validateAssignedVehicle(req, req.body.assignedVehicle))) return res.status(400).json({ message: "Assigned vehicle not found or not accessible." });
        data.assignedVehicle = req.body.assignedVehicle;
    }
    const driver = await Driver.create({ ...data, createdBy: req.user._id });
    const populated = await driver.populate("assignedVehicle", "vehicleNumber vehicleName type status");
    res.status(201).json(populated);
}

/* PUT /api/drivers/:id */
export async function updateDriver(req, res) {
    const changes = pickDriverFields(req.body);
    if (req.body.assignedVehicle !== undefined) {
        if (req.body.assignedVehicle && !(await validateAssignedVehicle(req, req.body.assignedVehicle))) return res.status(400).json({ message: "Assigned vehicle not found or not accessible." });
        changes.assignedVehicle = req.body.assignedVehicle || null;
    }
    const driver = await Driver.findOneAndUpdate(ownedQuery(req, { _id: req.params.id }), changes, {
        new: true,
        runValidators: true,
    }).populate("assignedVehicle", "vehicleNumber vehicleName type status");
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
}

/* DELETE /api/drivers/:id */
export async function deleteDriver(req, res) {
    const driver = await Driver.findOneAndDelete(ownedQuery(req, { _id: req.params.id }));
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Driver deleted" });
}

/* PATCH /api/drivers/:id/assign  — assign or unassign vehicle */
export async function assignVehicle(req, res) {
    const { vehicleId } = req.body;          // null to unassign

    // Never allow a manager to assign a vehicle outside their tenant.
    if (vehicleId && !(await validateAssignedVehicle(req, vehicleId))) {
        return res.status(400).json({ message: "Vehicle not found or not accessible." });
    }

    // Unassign this vehicle from any other driver first
    if (vehicleId) {
        await Driver.updateMany(
            ownedQuery(req, { assignedVehicle: vehicleId, _id: { $ne: req.params.id } }),
            { $set: { assignedVehicle: null } }
        );
    }

    const driver = await Driver.findOneAndUpdate(
        ownedQuery(req, { _id: req.params.id }),
        { assignedVehicle: vehicleId || null },
        { new: true, runValidators: true }
    ).populate("assignedVehicle", "vehicleNumber vehicleName type status");

    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
}

/* GET /api/drivers/stats */
export async function getDriverStats(req, res) {
    const [total, active, inactive, onLeave, assigned] = await Promise.all([
        Driver.countDocuments(ownedQuery(req)),
        Driver.countDocuments(ownedQuery(req, { status: "Active" })),
        Driver.countDocuments(ownedQuery(req, { status: "Inactive" })),
        Driver.countDocuments(ownedQuery(req, { status: "On Leave" })),
        Driver.countDocuments(ownedQuery(req, { assignedVehicle: { $ne: null } })),
    ]);
    res.json({ total, active, inactive, onLeave, assigned, unassigned: total - assigned });
}
