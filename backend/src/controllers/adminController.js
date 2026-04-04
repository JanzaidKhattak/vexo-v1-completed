const { Op } = require('sequelize')
const { Ad, User, Report, ActivityLog, BlacklistedEmail } = require('../models/index')
const { createNotification } = require('./notificationController')
const bcrypt = require('bcryptjs')

const getDashboard = async (req, res) => {
  try {
    const [totalAds, pendingAds, activeAds, soldAds, deletedAds, totalUsers, totalReports] = await Promise.all([
      Ad.count({ where: { isDeletedByUser: false } }),
      Ad.count({ where: { status: 'pending', isDeletedByUser: false } }),
      Ad.count({ where: { status: 'active', isDeletedByUser: false } }),
      Ad.count({ where: { status: 'sold' } }),
      Ad.count({ where: { isDeletedByUser: true } }),
      User.count(),
      Report.count({ where: { status: 'pending' } }),
    ])

    const recentPending = await Ad.findAll({
      where: { status: 'pending', isDeletedByUser: false },
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    })

    return res.status(200).json({
      success: true, totalUsers, totalAds, pendingAds, activeAds,
      soldAds, deletedAds, totalReports,
      recentPending: recentPending.map(ad => ({ ...ad.toJSON(), _id: ad.id })),
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = {}
    if (status === 'deleted') { where.isDeletedByUser = true }
    else if (status === 'sold') { where.status = 'sold'; where.isDeletedByUser = false }
    else if (status) { where.status = status; where.isDeletedByUser = false }

    const { count, rows: ads } = await Ad.findAndCountAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone'] }],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })

    return res.status(200).json({
      success: true,
      ads: ads.map(ad => ({ ...ad.toJSON(), _id: ad.id })),
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body
    const updateData = { status }
    if (status === 'active' || status === 'rejected') updateData.hasUpdate = false

    const ad = await Ad.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'email'] }],
    })
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    await ad.update(updateData)

    if (status === 'active') {
      await createNotification(ad.sellerId, '✅ Ad Approved!',
        `Your ad "${ad.title}" has been approved and is now live!`,
        'ad_approved', `/ads/${ad.id}`)
    } else if (status === 'rejected') {
      await createNotification(ad.sellerId, '❌ Ad Rejected',
        `Your ad "${ad.title}" was rejected. Please review and repost.`,
        'ad_rejected', `/profile?tab=ads&highlight=${ad.id}`)
    }

    await ActivityLog.create({
      performedById: req.user.id,
      action: status === 'active' ? 'approve_ad' : 'reject_ad',
      details: `${status === 'active' ? 'Approved' : 'Rejected'} ad: "${ad.title}"`,
    })

    return res.status(200).json({ success: true, ad: { ...ad.toJSON(), _id: ad.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const { count, rows: users } = await User.findAndCountAll({
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })
    return res.status(200).json({
      success: true,
      users: users.map(u => ({ ...u.toJSON(), _id: u.id })),
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { isActive, reason } = req.body
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    await user.update({
      isActive,
      blockReason: isActive ? '' : (reason || 'Violated community guidelines')
    })

    await createNotification(user.id,
      isActive ? '✅ Account Activated' : '🚫 Account Blocked',
      isActive ? 'Your account has been activated. Welcome back!' : `Your account has been blocked. Reason: ${reason || 'Violated community guidelines'}`,
      'general', '/')

    await ActivityLog.create({
      performedById: req.user.id,
      action: isActive ? 'unblock_user' : 'block_user',
      targetUserId: user.id,
      details: isActive ? `Unblocked user: ${user.email}` : `Blocked user: ${user.email} — Reason: ${reason || 'Violated community guidelines'}`
    })

    return res.status(200).json({ success: true, user: { ...user.toJSON(), _id: user.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { reason } = req.body
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (['admin', 'super-admin'].includes(user.role))
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' })

    await user.update({
      isDeleted: true, deletedAt: new Date(),
      email: `deleted_${user.id}@deleted.vexo`,
      firstName: 'Deleted', lastName: 'User', phone: '', avatar: ''
    })
    await Ad.update({ isDeletedByUser: true }, { where: { sellerId: user.id } })
    await BlacklistedEmail.findOrCreate({
      where: { email: user.email },
      defaults: { email: user.email, reason: reason || 'Policy violation', deletedById: req.user.id }
    })
    await ActivityLog.create({
      performedById: req.user.id, action: 'delete_user',
      details: `Permanently suspended: ${user.email} — Reason: ${reason || 'Policy violation'}`
    })

    return res.status(200).json({ success: true, message: 'User permanently suspended' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' })
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    await user.update({ role })
    return res.status(200).json({ success: true, user: { ...user.toJSON(), _id: user.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        { model: Ad, as: 'ad', attributes: ['id', 'title', 'images'] },
        { model: User, as: 'reportedBy', attributes: ['id', 'firstName', 'lastName', 'phone'] },
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

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body
    const report = await Report.findByPk(req.params.id)
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })
    await report.update({ status })
    return res.status(200).json({ success: true, report: { ...report.toJSON(), _id: report.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: ['admin', 'super-admin'] },
      order: [['createdAt', 'DESC']],
    })
    return res.status(200).json({ success: true, admins: admins.map(a => ({ ...a.toJSON(), _id: a.id })) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const addAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    if (!firstName || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' })
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await User.create({
      firstName, lastName: lastName || '', email,
      password: hashedPassword, role: 'admin',
      isActive: true, isEmailVerified: true, totalAds: 0
    })
    await ActivityLog.create({
      performedById: req.user.id, action: 'add_admin',
      targetUserId: admin.id, details: `Added new admin: ${email}`
    })
    return res.status(201).json({ success: true, admin: { ...admin.toJSON(), _id: admin.id } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findByPk(req.params.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
    if (admin.role === 'super-admin')
      return res.status(403).json({ success: false, message: 'Cannot delete super admin' })
    await admin.destroy()
    await ActivityLog.create({
      performedById: req.user.id, action: 'delete_admin',
      details: `Deleted admin: ${admin.email}`
    })
    return res.status(200).json({ success: true, message: 'Admin deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const resetAdminPassword = async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    const admin = await User.findByPk(req.params.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
    if (admin.role === 'super-admin')
      return res.status(403).json({ success: false, message: 'Cannot reset super admin password' })
    const hashedPassword = await bcrypt.hash(password, 10)
    await admin.update({ password: hashedPassword })
    await ActivityLog.create({
      performedById: req.user.id, action: 'reset_password',
      targetUserId: admin.id, details: `Reset password for admin: ${admin.email}`
    })
    return res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query
    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      include: [
        { model: User, as: 'performedBy', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
        { model: User, as: 'targetUser', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })
    return res.status(200).json({
      success: true,
      logs: logs.map(l => ({ ...l.toJSON(), _id: l.id })),
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  getDashboard, getAllAds, updateAdStatus, getAllUsers, updateUserStatus,
  deleteUser, updateUserRole, getAllReports, updateReportStatus,
  getAdmins, addAdmin, deleteAdmin, resetAdminPassword, getActivityLogs
}