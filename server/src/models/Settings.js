import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, trim: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        group: { type: String, default: "general" },
        label: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
