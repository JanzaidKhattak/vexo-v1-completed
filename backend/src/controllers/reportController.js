const { Op } = require('sequelize')
const { Report, Ad, User, BlacklistedEmail } = require('../models/index')
const { createNotification } = require('./notificationController')

const createReport = async (req, res) => {
  try {
    const { reason, comment, description } = req.body
    const adId = req.params.id
    const ad = await Ad.findByPk(adId)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    const existing = await Report.findOne({ where: { adId, reportedById: req.user.id } })
    if (existing) return res.status(400).json({ success: false, message: 'You have already reported this ad' })
    const report = await Report.create({ adId, reportedById: req.user.id, reason, comment: comment || description || '' })
    const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
    for (const admin of admins) {
      await createNotification(admin.id, '🚩 New Report', `"${ad.title}" reported: ${reason}`, 'report', '/vexo-admin/reports')
    }
    return res.status(201).json({ success: true, report: { ...report.toJSON(), _id: report.id } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getReports = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query
    const where = {}
    if (status !== 'all') where.status = status
    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        { model: Ad, as: 'ad', attributes: ['id', 'title', 'images', 'price', 'category', 'area', 'status', 'sellerId'],
          include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email'] }] },
        { model: User, as: 'reportedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'] },
        { model: User, as: 'actionBy', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })
    return res.status(200).json({
      success: true,
      reports: reports.map(r => ({ ...r.toJSON(), _id: r.id })),
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getBlockedAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      where: { status: 'blocked' },
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'isActive'] }],
      order: [['updatedAt', 'DESC']],
    })
    return res.status(200).json({ success: true, ads: ads.map(a => ({ ...a.toJSON(), _id: a.id })) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getBlockedUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { isActive: false, role: 'user' }, order: [['updatedAt', 'DESC']] })
    return res.status(200).json({ success: true, users: users.map(u => ({ ...u.toJSON(), _id: u.id })) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const unblockAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    await ad.update({ status: 'active', blockedAt: null, blockReason: null })
    await createNotification(ad.sellerId, '✅ Ad Restored', `Your ad "${ad.title}" is live again.`, 'ad_status', `/ads/${ad.id}`)
    await Report.update(
      { adminAction: 'ad_unblocked', actionNote: 'Ad restored by admin' },
      { where: { adId: ad.id, adminAction: 'ad_blocked' } }
    )
    return res.status(200).json({ success: true, message: 'Ad unblocked successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    await user.update({ isActive: true, blockReason: null })
    await Ad.update(
      { status: 'active', blockReason: null, blockedAt: null },
      { where: { sellerId: user.id, status: 'blocked', blockReason: 'Seller blocked' } }
    )
    await createNotification(user.id, '✅ Account Restored', 'Your account has been restored. Welcome back to VEXO!', 'general', '/')
    return res.status(200).json({ success: true, message: 'User unblocked successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const handleReportAction = async (req, res) => {
  try {
    const { action, actionNote } = req.body
    const report = await Report.findByPk(req.params.id, {
      include: [
        { model: Ad, as: 'ad', include: [{ model: User, as: 'seller' }] },
        { model: User, as: 'reportedBy' },
      ],
    })
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    report.actionNote = actionNote || ''
    report.actionById = req.user.id
    report.actionAt = new Date()

    if (action === 'block_ad') {
      if (report.ad) {
        await Ad.update({ status: 'blocked', blockedAt: new Date(), blockReason: report.reason }, { where: { id: report.adId } })
      }
      report.status = 'resolved'
      report.adminAction = 'ad_blocked'
      if (report.ad?.sellerId) {
        await createNotification(report.ad.sellerId, '🚫 Ad Blocked',
          `Your ad "${report.ad.title}" was blocked: ${report.reason}. Contact support to appeal.`,
          'ad_status', '/profile?tab=ads')
      }
    } else if (action === 'block_user') {
      if (report.ad?.seller) {
        const seller = report.ad.seller
        await seller.update({
          isActive: false,
          blockReason: actionNote || `Blocked: ${report.reason}`,
        })
        await Ad.update(
          { status: 'blocked', blockReason: 'Seller blocked', blockedAt: new Date() },
          { where: { sellerId: seller.id, status: 'active' } }
        )
        await BlacklistedEmail.findOrCreate({
          where: { email: seller.email },
          defaults: { email: seller.email, reason: actionNote || `Blocked: ${report.reason}`, deletedById: req.user.id }
        })
      }
      report.status = 'resolved'
      report.adminAction = 'user_blocked'
    } else if (action === 'warn_seller') {
      if (report.ad?.sellerId) {
        await createNotification(report.ad.sellerId, '⚠️ Policy Warning',
          `Your ad "${report.ad.title}" received a warning: ${actionNote || report.reason}. Please follow VEXO posting guidelines.`,
          'general', '/profile?tab=ads')
      }
      report.status = 'resolved'
      report.adminAction = 'warned'
    } else if (action === 'resolve') {
      report.status = 'resolved'
      report.adminAction = 'ignored'
    } else if (action === 'dismiss') {
      report.status = 'dismissed'
      report.adminAction = 'ignored'
    }

    await report.save()
    return res.status(200).json({ success: true, report: { ...report.toJSON(), _id: report.id } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getReportStats = async (req, res) => {
  try {
    const [pending, resolved, dismissed, total, blockedAds, blockedUsers] = await Promise.all([
      Report.count({ where: { status: 'pending' } }),
      Report.count({ where: { status: 'resolved' } }),
      Report.count({ where: { status: 'dismissed' } }),
      Report.count(),
      Ad.count({ where: { status: 'blocked' } }),
      User.count({ where: { isActive: false, role: 'user' } }),
    ])
    return res.status(200).json({ success: true, stats: { pending, resolved, dismissed, total, blockedAds, blockedUsers } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { createReport, getReports, getBlockedAds, getBlockedUsers, unblockAd, unblockUser, handleReportAction, getReportStats }