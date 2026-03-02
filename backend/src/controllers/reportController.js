const Report = require('../models/Report')
const Ad = require('../models/Ad')

const createReport = async (req, res) => {
  try {
    const { reason, description } = req.body
    const adId = req.params.id

    const ad = await Ad.findById(adId)
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    const existingReport = await Report.findOne({
      ad: adId,
      reportedBy: req.user._id
    })

    if (existingReport) {
      return res.status(400).json({ success: false, message: 'Already reported' })
    }

    const report = await Report.create({
      ad: adId,
      reportedBy: req.user._id,
      reason,
      description: description || ''
    })

    return res.status(201).json({ success: true, report })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { createReport }