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
    const report = await Report.create({ ad: adId, reportedBy: req.user._id, reason, comment: comment || description || '' })
    // Notify admins (both admin and super-admin)
    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } })
    for (const admin of admins) {
      await createNotification(admin._id, '🚩 New Report', `"${ad.title}" reported: ${reason}`, 'report', '/vexo-admin/reports')
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
      .populate({ path: 'ad', select: 'title images price category area _id seller status', populate: { path: 'seller', select: 'firstName lastName email' } })
      .populate('reportedBy', 'firstName lastName email phone avatar')
      .populate('actionBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    return res.status(200).json({ success: true, reports, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Get Blocked Ads ────────────────────────────────────────────────────
const getBlockedAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'blocked' })
      .populate('seller', 'firstName lastName email phone avatar isActive')
      .sort({ updatedAt: -1 })
    return res.status(200).json({ success: true, ads })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Get Blocked Users ──────────────────────────────────────────────────
const getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: false, role: 'user' }).sort({ updatedAt: -1 })
    return res.status(200).json({ success: true, users })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Unblock Ad ─────────────────────────────────────────────────────────
const unblockAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    ad.status = 'active'
    ad.blockedAt = null
    ad.blockReason = null
    await ad.save()
    // Notify seller
    await createNotification(ad.seller, '✅ Ad Restored', `Your ad "${ad.title}" is live again.`, 'ad_status', `/ads/${ad._id}`)
    // Update related reports
    await Report.updateMany({ ad: ad._id, adminAction: 'ad_blocked' }, { $set: { adminAction: 'ad_unblocked', actionNote: 'Ad restored by admin' } })
    return res.status(200).json({ success: true, message: 'Ad unblocked successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Unblock User ───────────────────────────────────────────────────────
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    user.isActive = true
    user.blockReason = null
    user.blockedAt = null
    await user.save()
    // Restore ads that were blocked because of seller block
    await Ad.updateMany({ seller: user._id, status: 'blocked', blockReason: 'Seller blocked' }, { status: 'active', blockReason: null, blockedAt: null })
    await createNotification(user._id, '✅ Account Restored', 'Your account has been restored. Welcome back to VEXO!', 'general', '/')
    return res.status(200).json({ success: true, message: 'User unblocked successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Take Action on Report ─────────────────────────────────────────────
const handleReportAction = async (req, res) => {
  try {
    const { action, actionNote } = req.body
    const report = await Report.findById(req.params.id)
      .populate({ path: 'ad', populate: { path: 'seller', model: 'User' } })
      .populate('reportedBy')
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    report.actionNote = actionNote || ''
    report.actionBy   = req.user._id
    report.actionAt   = new Date()

    if (action === 'block_ad') {
      if (report.ad) {
        await Ad.findByIdAndUpdate(report.ad._id, { status: 'blocked', blockedAt: new Date(), blockReason: report.reason })
      }
      report.status      = 'resolved'
      report.adminAction = 'ad_blocked'
      if (report.ad?.seller) {
        await createNotification(
          report.ad.seller._id || report.ad.seller,
          '🚫 Ad Blocked',
          `Your ad "${report.ad.title}" was blocked: ${report.reason}. Contact support to appeal.`,
          'ad_status', '/profile?tab=ads'
        )
      }

    } else if (action === 'block_user') {
      if (report.ad?.seller) {
        const seller = await User.findById(report.ad.seller._id || report.ad.seller)
        if (seller) {
          seller.isActive    = false
          seller.blockReason = actionNote || `Blocked: ${report.reason}`
          seller.blockedAt   = new Date()
          await seller.save()
          // Block all their active ads
          await Ad.updateMany({ seller: seller._id, status: 'active' }, { status: 'blocked', blockReason: 'Seller blocked', blockedAt: new Date() })
          // Blacklist email to prevent re-registration
          await BlacklistedEmail.findOneAndUpdate(
            { email: seller.email },
            { email: seller.email, reason: actionNote || `Blocked: ${report.reason}`, deletedBy: req.user._id },
            { upsert: true, new: true }
          )
        }
      }
      report.status      = 'resolved'
      report.adminAction = 'user_blocked'

    } else if (action === 'warn_seller') {
      if (report.ad?.seller) {
        await createNotification(
          report.ad.seller._id || report.ad.seller,
          '⚠️ Policy Warning',
          `Your ad "${report.ad.title}" received a warning: ${actionNote || report.reason}. Please follow VEXO posting guidelines.`,
          'general', '/profile?tab=ads'
        )
      }
      report.status      = 'resolved'
      report.adminAction = 'warned'

    } else if (action === 'resolve') {
      report.status      = 'resolved'
      report.adminAction = 'ignored'

    } else if (action === 'dismiss') {
      report.status      = 'dismissed'
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
    const [pending, resolved, dismissed, total, blockedAds, blockedUsers] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments(),
      Ad.countDocuments({ status: 'blocked' }),
      User.countDocuments({ isActive: false, role: 'user' }),
    ])
    return res.status(200).json({ success: true, stats: { pending, resolved, dismissed, total, blockedAds, blockedUsers } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { createReport, getReports, getBlockedAds, getBlockedUsers, unblockAd, unblockUser, handleReportAction, getReportStats }