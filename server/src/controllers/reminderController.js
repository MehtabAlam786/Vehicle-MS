import Reminder from "../models/Reminder.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import { ownedQuery } from "../middleware/accessControl.js";

/* ── helpers ─────────────────────────────────────── */
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function addMonths(date, m) { const d = new Date(date); d.setMonth(d.getMonth() + m); return d; }
function addYears(date, y) { const d = new Date(date); d.setFullYear(d.getFullYear() + y); return d; }

function nextDueDate(reminder) {
    const base = new Date(reminder.dueDate);
    switch (reminder.repeat) {
        case "Daily": return addDays(base, 1);
        case "Weekly": return addDays(base, 7);
        case "Monthly": return addMonths(base, 1);
        case "Yearly": return addYears(base, 1);
        default: return null;
    }
}

/* ── GET /api/reminders ───────────────────────────── */
export async function getReminders(req, res) {
    // Auto-sync overdue statuses
    await Reminder.updateMany(
        ownedQuery(req, { status: "Pending", dueDate: { $lt: new Date() } }),
        { $set: { status: "Overdue" } }
    );
    // Un-snooze expired snoozes
    await Reminder.updateMany(
        ownedQuery(req, { status: "Snoozed", snoozeUntil: { $lt: new Date() } }),
        { $set: { status: "Pending", snoozeUntil: null } }
    );

    const reminders = await Reminder.find(ownedQuery(req))
        .populate("vehicle", "vehicleNumber vehicleName type")
        .populate("driver", "name employeeId")
        .sort({ dueDate: 1 });

    res.json(reminders);
}

/* ── GET /api/reminders/stats ────────────────────── */
export async function getReminderStats(req, res) {
    const [total, pending, overdue, completed, snoozed, high] = await Promise.all([
        Reminder.countDocuments(ownedQuery(req)),
        Reminder.countDocuments(ownedQuery(req, { status: "Pending" })),
        Reminder.countDocuments(ownedQuery(req, { status: "Overdue" })),
        Reminder.countDocuments(ownedQuery(req, { status: "Completed" })),
        Reminder.countDocuments(ownedQuery(req, { status: "Snoozed" })),
        Reminder.countDocuments(ownedQuery(req, { status: { $in: ["Pending", "Overdue"] }, priority: "High" })),
    ]);
    // Due in next 7 days
    const soon = await Reminder.countDocuments(ownedQuery(req, {
        status: { $in: ["Pending", "Snoozed"] },
        dueDate: { $gte: new Date(), $lte: addDays(new Date(), 7) },
    }));
    res.json({ total, pending, overdue, completed, snoozed, high, soon });
}

/* ── POST /api/reminders ─────────────────────────── */
const REMINDER_FIELDS = ["title", "description", "category", "priority", "dueDate", "vehicle", "driver", "repeat"];
const pickReminderFields = (body) => Object.fromEntries(REMINDER_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

async function validateRelations(req, data) {
    if (data.vehicle && !(await Vehicle.findOne(ownedQuery(req, { _id: data.vehicle })).select("_id"))) return "Vehicle not found or not accessible.";
    if (data.driver && !(await Driver.findOne(ownedQuery(req, { _id: data.driver })).select("_id"))) return "Driver not found or not accessible.";
    return null;
}

export async function createReminder(req, res) {
    const data = pickReminderFields(req.body);
    const relationError = await validateRelations(req, data);
    if (relationError) return res.status(400).json({ message: relationError });
    const reminder = await Reminder.create({ ...data, createdBy: req.user._id });
    const populated = await reminder.populate([
        { path: "vehicle", select: "vehicleNumber vehicleName type" },
        { path: "driver", select: "name employeeId" },
    ]);
    res.status(201).json(populated);
}

/* ── PUT /api/reminders/:id ──────────────────────── */
export async function updateReminder(req, res) {
    const changes = pickReminderFields(req.body);
    const relationError = await validateRelations(req, changes);
    if (relationError) return res.status(400).json({ message: relationError });
    const reminder = await Reminder.findOneAndUpdate(ownedQuery(req, { _id: req.params.id }), changes, {
        new: true, runValidators: true,
    }).populate([
        { path: "vehicle", select: "vehicleNumber vehicleName type" },
        { path: "driver", select: "name employeeId" },
    ]);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
}

/* ── DELETE /api/reminders/:id ───────────────────── */
export async function deleteReminder(req, res) {
    const reminder = await Reminder.findOne(ownedQuery(req, { _id: req.params.id }));
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    if (reminder.isAuto) return res.status(400).json({ message: "System reminders cannot be deleted." });
    await reminder.deleteOne();
    res.json({ message: "Reminder deleted" });
}

/* ── PATCH /api/reminders/:id/complete ──────────── */
export async function completeReminder(req, res) {
    const reminder = await Reminder.findOne(ownedQuery(req, { _id: req.params.id }));
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.status = "Completed";
    reminder.completedAt = new Date();

    // If recurring, create next occurrence
    if (reminder.repeat !== "None") {
        const nextDate = nextDueDate(reminder);
        if (nextDate) {
            await Reminder.create({
                title: reminder.title,
                description: reminder.description,
                category: reminder.category,
                priority: reminder.priority,
                dueDate: nextDate,
                vehicle: reminder.vehicle,
                driver: reminder.driver,
                repeat: reminder.repeat,
                isAuto: reminder.isAuto,
                createdBy: reminder.createdBy,
            });
        }
    }

    await reminder.save();
    const populated = await reminder.populate([
        { path: "vehicle", select: "vehicleNumber vehicleName type" },
        { path: "driver", select: "name employeeId" },
    ]);
    res.json(populated);
}

/* ── PATCH /api/reminders/:id/snooze ────────────── */
export async function snoozeReminder(req, res) {
    const { days = 3 } = req.body;
    const reminder = await Reminder.findOne(ownedQuery(req, { _id: req.params.id }));
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.status = "Snoozed";
    reminder.snoozeUntil = addDays(new Date(), Number(days));
    await reminder.save();

    const populated = await reminder.populate([
        { path: "vehicle", select: "vehicleNumber vehicleName type" },
        { path: "driver", select: "name employeeId" },
    ]);
    res.json(populated);
}

/* ── POST /api/reminders/sync ────────────────────── 
   Auto-generate reminders from:
   - vehicles with overdue / due-soon service
   - drivers with expiring licenses
   ─────────────────────────────────────────────── */
export async function syncAutoReminders(req, res) {
    const [vehicles, drivers] = await Promise.all([
        Vehicle.find(ownedQuery(req)),
        Driver.find(ownedQuery(req)),
    ]);

    let created = 0;

    for (const v of vehicles) {
        const rem = v.nextServiceKm - v.currentKm;
        if (rem <= 1000) {
            // Check if active auto reminder already exists for this vehicle's service
            const exists = await Reminder.findOne({
                vehicle: v._id,
                category: "Service",
                isAuto: true,
                status: { $in: ["Pending", "Overdue", "Snoozed"] },
            });
            if (!exists) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (rem <= 0 ? 0 : Math.ceil(rem / 50))); // rough estimate
                await Reminder.create({
                    title: `Service Due — ${v.vehicleNumber}`,
                    description: rem <= 0
                        ? `${v.vehicleName} is overdue for service by ${Math.abs(rem).toLocaleString()} KM.`
                        : `${v.vehicleName} service due in ${rem.toLocaleString()} KM.`,
                    category: "Service",
                    priority: rem <= 0 ? "High" : "Medium",
                    dueDate,
                    vehicle: v._id,
                    isAuto: true,
                    status: rem <= 0 ? "Overdue" : "Pending",
                    createdBy: req.user._id,
                });
                created++;
            }
        }
    }

    for (const d of drivers) {
        const expiry = new Date(d.licenseExpiry);
        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
            const exists = await Reminder.findOne({
                driver: d._id,
                category: "License",
                isAuto: true,
                status: { $in: ["Pending", "Overdue", "Snoozed"] },
            });
            if (!exists) {
                await Reminder.create({
                    title: `License Expiry — ${d.name}`,
                    description: daysLeft <= 0
                        ? `${d.name}'s driving license has expired.`
                        : `${d.name}'s driving license expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
                    category: "License",
                    priority: daysLeft <= 0 ? "High" : daysLeft <= 7 ? "High" : "Medium",
                    dueDate: expiry,
                    driver: d._id,
                    isAuto: true,
                    status: daysLeft <= 0 ? "Overdue" : "Pending",
                    createdBy: req.user._id,
                });
                created++;
            }
        }
    }

    res.json({ message: `Synced successfully. ${created} new reminder${created !== 1 ? "s" : ""} created.`, created });
}
