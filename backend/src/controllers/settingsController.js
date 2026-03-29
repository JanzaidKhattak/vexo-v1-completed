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

    // Favicon upload
    if (req.files?.favicon?.[0]) {
      updates.faviconUrl = req.files.favicon[0].path;
    }

    // Hero banner upload
    if (req.files?.heroBanner?.[0]) {
      updates.heroBannerImage = req.files.heroBanner[0].path;
    }

    // Categories parse karo
    if (updates.categories && typeof updates.categories === "string") {
      updates.categories = JSON.parse(updates.categories);
    }

    // Category icon files — catIcon_0, catIcon_1, catIcon_2 ...
    // Frontend sends them as catIcon_INDEX in formData
    if (updates.categories && Array.isArray(updates.categories)) {
      for (const key of Object.keys(req.files || {})) {
        if (key.startsWith("catIcon_")) {
          const idx = parseInt(key.replace("catIcon_", ""), 10);
          const file = req.files[key]?.[0];
          if (file && updates.categories[idx] !== undefined) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "vexo/category-icons",
              transformation: [{ width: 128, height: 128, crop: "fit" }],
            });
            updates.categories[idx].iconUrl = result.secure_url;
          }
        }
      }
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(updates);
    } else {
      // Simple fields
      const simpleFields = [
        'siteName','heroHeading','heroSubheading','heroButtonText',
        'whatsappNumber','facebookUrl','instagramUrl','youtubeUrl','twitterUrl',
        'chatButtonEnabled','chatButtonNumber','supportEmail','supportWhatsapp',
        'footerAddress','logoUrl','faviconUrl','heroBannerImage'
      ];
      simpleFields.forEach(field => {
        if (updates[field] !== undefined) settings[field] = updates[field];
      });

      // Categories — markModified zaroori hai nested array ke liye
      if (updates.categories) {
        settings.categories = updates.categories;
        settings.markModified('categories');
      }

      await settings.save();
    }

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error("updateSettings error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSettings, updateSettings };