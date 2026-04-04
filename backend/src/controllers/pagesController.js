const { Page } = require('../models/index')

const getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: req.params.slug } })
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' })
    return res.status(200).json({ success: true, page: { ...page.toJSON(), _id: page.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllPages = async (req, res) => {
  try {
    const pages = await Page.findAll({ attributes: ['id', 'slug', 'title', 'updatedAt'] })
    return res.status(200).json({ success: true, pages: pages.map(p => ({ ...p.toJSON(), _id: p.id })) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const upsertPage = async (req, res) => {
  try {
    const { slug, title, subtitle, badge, sections } = req.body
    const [page, created] = await Page.findOrCreate({
      where: { slug },
      defaults: { slug, title, subtitle, badge, sections },
    })
    if (!created) {
      await page.update({ title, subtitle, badge, sections })
    }
    return res.status(200).json({ success: true, page: { ...page.toJSON(), _id: page.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deletePage = async (req, res) => {
  try {
    await Page.destroy({ where: { slug: req.params.slug } })
    return res.status(200).json({ success: true, message: 'Page deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { getPage, getAllPages, upsertPage, deletePage }