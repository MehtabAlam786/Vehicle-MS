import Settings from "../models/Settings.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Fuel from "../models/Fuel.js";
import Maintenance from "../models/Maintenance.js";
import Reminder from "../models/Reminder.js";
import mongoose from "mongoose";
import { ownedQuery } from "../middleware/accessControl.js";

/* ── default settings ── */
const DEFAULTS = {
    profile_name: { value: "Mehtab Alam", group: "profile", label: "Full Name" },
    profile_email: { value: "admin@vehiclems.com", group: "profile", label: "Email" },
    profile_phone: { value: "+91 98765 43210", group: "profile", label: "Phone" },
    profile_role: { value: "Admin", group: "profile", label: "Role" },
    company_name: { value: "VehicleMS Pvt. Ltd.", group: "company", label: "Company Name" },
    company_address: { value: "123, MG Road, Mumbai", group: "company", label: "Address" },
    company_phone: { value: "+91 22 1234 5678", group: "company", label: "Company Phone" },
    company_email: { value: "info@vehiclems.com", group: "company", label: "Company Email" },
    company_gst: { value: "", group: "company", label: "GST Number" },
    company_logo: { value: "🚗", group: "company", label: "Logo Emoji" },
    notif_service_due: { value: true, group: "notifications", label: "Service Due Alerts" },
    notif_fuel_low: { value: true, group: "notifications", label: "Fuel Reminders" },
    notif_license_exp: { value: true, group: "notifications", label: "License Expiry Alerts" },
    notif_insurance: { value: true, group: "notifications", label: "Insurance Reminders" },
    notif_email: { value: false, group: "notifications", label: "Email Notifications" },
    notif_sound: { value: true, group: "notifications", label: "Sound Alerts" },
    service_due_km: { value: 500, group: "notifications", label: "Service Due KM Threshold" },
    license_exp_days: { value: 30, group: "notifications", label: "License Expiry Days" },
    currency: { value: "INR", group: "system", label: "Currency" },
    currency_symbol: { value: "₹", group: "system", label: "Currency Symbol" },
    date_format: { value: "DD MMM YYYY", group: "system", label: "Date Format" },
    distance_unit: { value: "km", group: "system", label: "Distance Unit" },
    fuel_unit: { value: "L", group: "system", label: "Fuel Unit" },
    timezone: { value: "Asia/Kolkata", group: "system", label: "Timezone" },
    theme: { value: "light", group: "appearance", label: "Theme" },
    primary_color: { value: "#4f6ef7", group: "appearance", label: "Primary Color" },
    sidebar_color: { value: "#0f172a", group: "appearance", label: "Sidebar Color" },
    compact_mode: { value: false, group: "appearance", label: "Compact Mode" },
};

function toMap(records) {
    const map = {};
    records.forEach(r => { map[r.key] = r.value; });
    return map;
}

/* ── GET /api/settings ── */
export async function getSettings(req, res) {
    try {
        let records = await Settings.find();
        if (records.length === 0) {
            const docs = Object.entries(DEFAULTS).map(([key, v]) => ({ key, ...v }));
            records = await Settings.insertMany(docs);
        } else {
            // Upsert any missing default keys (schema additions over time)
            const existingKeys = new Set(records.map(r => r.key));
            const missing = Object.entries(DEFAULTS).filter(([k]) => !existingKeys.has(k));
            if (missing.length) {
                const docs = missing.map(([key, v]) => ({ key, ...v }));
                const inserted = await Settings.insertMany(docs);
                records = [...records, ...inserted];
            }
        }
        const result = toMap(records);
        result.profile_name = req.user.name;
        result.profile_email = req.user.email;
        result.profile_phone = req.user.phone || "";
        result.profile_role = req.user.role;
        res.json(result);
    } catch (err) {
        console.error("getSettings error:", err);
        res.status(500).json({ message: "Failed to load settings", error: err.message });
    }
}

/* ── PUT /api/settings ── bulk upsert ── */
export async function updateSettings(req, res) {
    try {
        // Profile identity is owned by the User document and cannot be changed
        // through the generic settings endpoint.
        const entries = Object.entries(req.body).filter(([key]) => !key.startsWith("profile_"));
        if (!entries.length) return res.status(400).json({ message: "No editable settings provided" });

        const ops = entries.map(([key, value]) => ({
            updateOne: {
                filter: { key },
                update: {
                    $set: {
                        value,
                        key,
                        group: DEFAULTS[key]?.group || "general",
                        label: DEFAULTS[key]?.label || key,
                    },
                },
                upsert: true,
            },
        }));
        await Settings.bulkWrite(ops);

        const all = await Settings.find();
        const result = toMap(all);
        result.profile_name = req.user.name;
        result.profile_email = req.user.email;
        result.profile_phone = req.user.phone || "";
        result.profile_role = req.user.role;
        res.json(result);
    } catch (err) {
        console.error("updateSettings error:", err);
        res.status(500).json({ message: "Failed to save settings", error: err.message });
    }
}

/* ── GET /api/settings/system-info ── */
export async function getSystemInfo(req, res) {
    try {
        const [vehicles, drivers, fuel, maintenance, reminders] = await Promise.all([
            Vehicle.countDocuments(ownedQuery(req)),
            Driver.countDocuments(ownedQuery(req)),
            Fuel.countDocuments(ownedQuery(req)),
            Maintenance.countDocuments(ownedQuery(req)),
            Reminder.countDocuments(ownedQuery(req)),
        ]);

        let dbStats = null;
        try { dbStats = await mongoose.connection.db.stats(); } catch { /* non-fatal */ }

        res.json({
            records: { vehicles, drivers, fuel, maintenance, reminders },
            db: {
                name: mongoose.connection.name || "—",
                host: mongoose.connection.host || "—",
                port: mongoose.connection.port || "—",
                dataSize: dbStats ? (dbStats.dataSize / 1024).toFixed(1) + " KB" : "—",
                collections: dbStats?.collections ?? "—",
                status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
            },
            server: {
                nodeVersion: process.version,
                platform: process.platform,
                uptime: Math.floor(process.uptime()),
                memoryMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
                env: process.env.NODE_ENV || "development",
            },
        });
    } catch (err) {
        console.error("getSystemInfo error:", err);
        res.status(500).json({ message: "Failed to load system info", error: err.message });
    }
}

/* ── DELETE /api/settings/data/:collection ── */
export async function clearCollection(req, res) {
    try {
        const allowed = {
            vehicles: Vehicle,
            drivers: Driver,
            fuel: Fuel,
            maintenance: Maintenance,
            reminders: Reminder,
        };
        const Model = allowed[req.params.collection];
        if (!Model) return res.status(400).json({ message: `Invalid collection: "${req.params.collection}"` });

        const result = await Model.deleteMany(ownedQuery(req));
        res.json({
            message: `Cleared ${result.deletedCount} record(s) from ${req.params.collection}.`,
            deleted: result.deletedCount,
            collection: req.params.collection,
        });
    } catch (err) {
        console.error("clearCollection error:", err);
        res.status(500).json({ message: "Failed to clear collection", error: err.message });
    }
}
