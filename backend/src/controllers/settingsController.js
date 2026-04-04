const { SiteSettings } = require('../models/index')
const { cloudinary } = require('../config/cloudinary')

const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne()
    if (!settings) settings = await SiteSettings.create({})
    return res.status(200).json({ success: true, settings: formatSettings(settings) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateSettings = async (req, res) => {
  try {
    const updates = { ...req.body }

    if (req.files?.logo?.[0]) updates.logoUrl = req.files.logo[0].path
    if (req.files?.favicon?.[0]) updates.faviconUrl = req.files.favicon[0].path
    if (req.files?.heroBanner?.[0]) updates.heroBannerImage = req.files.heroBanner[0].path

    if (updates.categories && typeof updates.categories === 'string') {
      updates.categories = JSON.parse(updates.categories)
    }

    if (updates.categories && Array.isArray(updates.categories)) {
      for (const key of Object.keys(req.files || {})) {
        if (key.startsWith('catIcon_')) {
          const idx = parseInt(key.replace('catIcon_', ''), 10)
          const file = req.files[key]?.[0]
          if (file && updates.categories[idx] !== undefined) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'vexo/category-icons',
              transformation: [{ width: 128, height: 128, crop: 'fit' }],
            })
            updates.categories[idx].iconUrl = result.secure_url
          }
        }
      }
    }

    let settings = await SiteSettings.findOne()
    if (!settings) {
      settings = await SiteSettings.create(updates)
    } else {
      const simpleFields = [
        'siteName', 'heroHeading', 'heroSubheading', 'heroButtonText',
        'whatsappNumber', 'facebookUrl', 'instagramUrl', 'youtubeUrl', 'twitterUrl',
        'chatButtonEnabled', 'chatButtonNumber', 'supportEmail', 'supportWhatsapp',
        'footerAddress', 'logoUrl', 'faviconUrl', 'heroBannerImage'
      ]
      const updateData = {}
      simpleFields.forEach(field => {
        if (updates[field] !== undefined) updateData[field] = updates[field]
      })
      if (updates.categories) updateData.categories = updates.categories
      await settings.update(updateData)
    }

    return res.status(200).json({ success: true, settings: formatSettings(settings) })
  } catch (error) {
    console.error('updateSettings error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const formatSettings = (settings) => {
  const plain = settings.toJSON ? settings.toJSON() : settings
  return { ...plain, _id: plain.id }
}

module.exports = { getSettings, updateSettings }