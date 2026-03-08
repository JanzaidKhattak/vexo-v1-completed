const Report = require('../models/Report')
const Ad = require('../models/Ad')
const User = require('../models/User')
const BlacklistedEmail = require('../models/BlacklistedEmail')
const { createNotification } = require('./notificationController')

// ── User: Submit Report ───────────────────────────────────────────────────────
const createReport = async (req, res) => {
  try {
    const { reason, comment, description } = req.body
    const adId = req.params.id

    const ad = await Ad.findById(adId)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    const existing = await Report.findOne({ ad: adId, reportedBy: req.user._id })
    if (existing) return res.status(400).json({ success: false, message: 'You have already reported this ad' })

    const report = await Report.create({
      ad: adId,
      reportedBy: req.user._id,
      reason,
      comment: comment || description || ''
    })

    // Notify admins
    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Ad Report',
        `Ad "${ad.title}" was reported for: ${reason}`,
        'general',
        '/vexo-admin/reports'
      )
    }

    return res.status(201).json({ success: true, report })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Get All Reports ────────────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query
    const query = {}
    if (status !== 'all') query.status = status

    const total = await Report.countDocuments(query)
    const reports = await Report.find(query)
      .populate('ad', 'title images price category area _id')
      .populate('reportedBy', 'firstName lastName email phone avatar')
      .populate('actionBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      reports,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Take Action on Report ─────────────────────────────────────────────
const handleReportAction = async (req, res) => {
  try {
    const { action, actionNote } = req.body
    // action: 'block_ad' | 'block_user' | 'resolve' | 'dismiss'

    const report = await Report.findById(req.params.id)
      .populate('ad')
      .populate('reportedBy')

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    report.actionNote = actionNote || ''
    report.actionBy = req.user._id
    report.actionAt = new Date()

    if (action === 'block_ad') {
      // Block the ad (set status to rejected)
      if (report.ad) {
        await Ad.findByIdAndUpdate(report.ad._id, { status: 'rejected' })
      }
      report.status = 'resolved'
      report.adminAction = 'ad_blocked'

      // Notify the ad seller
      if (report.ad?.seller) {
        await createNotification(
          report.ad.seller,
          'Your Ad Has Been Removed',
          `Your ad "${report.ad.title}" was removed due to a report: ${report.reason}`,
          'general',
          '/profile'
        )
      }

    } else if (action === 'block_user') {
      // Block the user who posted the ad (soft delete + blacklist)
      if (report.ad?.seller) {
        const seller = await User.findById(report.ad.seller)
        if (seller) {
          // Blacklist their email
          const BlacklistedEmail = require('../models/BlacklistedEmail')
          await BlacklistedEmail.findOneAndUpdate(
            { email: seller.email },
            {
              email: seller.email,
              reason: `Blocked due to ad report: ${report.reason}`,
              deletedBy: req.user._id
            },
            { upsert: true, new: true }
          )

          // Soft delete user
          seller.isDeleted = true
          seller.deletedAt = new Date()
          const oldEmail = seller.email
          seller.email = `deleted_${seller._id}@deleted.vexo`
          seller.firstName = 'Deleted'
          seller.lastName = 'User'
          seller.phone = null
          await seller.save()

          // Reject all their ads
          await Ad.updateMany({ seller: seller._id }, { status: 'rejected' })
        }
      }
      report.status = 'resolved'
      report.adminAction = 'user_blocked'

    } else if (action === 'resolve') {
      // Just mark resolved, ad stays
      report.status = 'resolved'
      report.adminAction = 'ignored'

    } else if (action === 'dismiss') {
      report.status = 'dismissed'
      report.adminAction = 'ignored'
    }

    await report.save()

    return res.status(200).json({ success: true, report })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Get Report Stats ───────────────────────────────────────────────────
const getReportStats = async (req, res) => {
  try {
    const [pending, resolved, dismissed, total] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments(),
    ])
    return res.status(200).json({ success: true, stats: { pending, resolved, dismissed, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { createReport, getReports, handleReportAction, getReportStats }