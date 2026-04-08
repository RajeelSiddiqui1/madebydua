import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  heroImage: {
    type: String,
    default: ""
  },
  features: [{
    icon: { type: String, default: "Shield" },
    title: String,
    description: String
  }]
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
