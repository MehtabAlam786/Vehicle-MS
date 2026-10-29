import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
        description: { type: String, default: "", trim: true, maxlength: 2000 },
        category: {
            type: String,
            enum: ["Service", "Insurance", "License", "Tax", "Pollution", "Fuel", "Tyre", "Battery", "Other"],
            default: "Other",
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        dueDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Snoozed", "Overdue"],
            default: "Pending",
        },
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
        // auto = system-generated (cannot be deleted, only completed/snoozed)
        isAuto: { type: Boolean, default: false },
        // snooze until date
        snoozeUntil: { type: Date, default: null },
        // recurring: none | daily | weekly | monthly | yearly
        repeat: { type: String, enum: ["None", "Daily", "Weekly", "Monthly", "Yearly"], default: "None" },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Virtual: days until / overdue
reminderSchema.virtual("daysLeft").get(function () {
    return Math.ceil((new Date(this.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
});

reminderSchema.set("toJSON", { virtuals: true });

reminderSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model("Reminder", reminderSchema);
