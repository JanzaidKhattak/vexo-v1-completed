const Page = require('../models/Page')

// Get page by slug (public)
const getPage = async (req, res) => {
  try {
    let page = await Page.findOne({ slug: req.params.slug })

    // If page doesn't exist in DB, return default
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }

    return res.status(200).json({ success: true, page })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Get all pages (admin)
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().select('slug title updatedAt')
    return res.status(200).json({ success: true, pages })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Create or update page (admin)
const upsertPage = async (req, res) => {
  try {
    const { slug, title, subtitle, badge, sections } = req.body

    const page = await Page.findOneAndUpdate(
      { slug },
      { slug, title, subtitle, badge, sections },
      { new: true, upsert: true }
    )

    return res.status(200).json({ success: true, page })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Delete page (admin)
const deletePage = async (req, res) => {
  try {
    await Page.findOneAndDelete({ slug: req.params.slug })
    return res.status(200).json({ success: true, message: 'Page deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { getPage, getAllPages, upsertPage, deletePage }