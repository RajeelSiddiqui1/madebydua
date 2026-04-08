import Settings from "../models/settingsModel.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        heroImage: "",
        features: [
          { icon: "Shield", title: "Repeated Customer", description: "10% off on your next purchase" },
          { icon: "Heart", title: "Careful Packaging", description: "Securely packed for safe arrival" },
          { icon: "Package", title: "Prepaid Order", description: "Enjoy free shopping on order above 3499" },
          { icon: "Truck", title: "Nationwide Delivery", description: "Delivery available across Pakistan" }
        ]
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { heroImage, features } = req.body;
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { heroImage, features },
        { new: true }
      );
    } else {
      settings = await Settings.create({ heroImage, features });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { heroImage: req.file.filename },
        { new: true }
      );
    } else {
      settings = await Settings.create({
        heroImage: req.file.filename,
        features: [
          { icon: "Shield", title: "Repeated Customer", description: "10% off on your next purchase" },
          { icon: "Heart", title: "Careful Packaging", description: "Securely packed for safe arrival" },
          { icon: "Package", title: "Prepaid Order", description: "Enjoy free shopping on order above 3499" },
          { icon: "Truck", title: "Nationwide Delivery", description: "Delivery available across Pakistan" }
        ]
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
