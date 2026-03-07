const SiteSettings = require("../models/SiteSettings");
const { cloudinary } = require("../config/cloudinary");

// Get settings (public)
const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update settings (admin)
const updateSettings = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Logo upload
    if (req.files?.logo?.[0]) {
      updates.logoUrl = req.files.logo[0].path;
    }

    // Fevicon upload
    if (req.files?.favicon?.[0]) {
      updates.faviconUrl = req.files.favicon[0].path;
    }
    // Hero banner upload
    if (req.files?.heroBanner?.[0]) {
      updates.heroBannerImage = req.files.heroBanner[0].path;
    }

    // Categories parse karo agar string hai
    if (updates.categories && typeof updates.categories === "string") {
      updates.categories = JSON.parse(updates.categories);
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSettings, updateSettings };
