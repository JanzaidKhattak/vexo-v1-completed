const Ad = require('../models/Ad')
const User = require('../models/User')
const Report = require('../models/Report')
const { createNotification } = require('./notificationController')
const ActivityLog = require('../models/ActivityLog')
const bcrypt = require('bcryptjs')

const getDashboard = async (req, res) => {
  try {
    const totalAds = await Ad.countDocuments({ isDeletedByUser: false })
    const pendingAds = await Ad.countDocuments({ status: 'pending', isDeletedByUser: false })
    const activeAds = await Ad.countDocuments({ status: 'active', isDeletedByUser: false })
    const soldAds = await Ad.countDocuments({ status: 'sold' })
    const deletedAds = await Ad.countDocuments({ isDeletedByUser: true })
    const totalUsers = await User.countDocuments()
    const totalReports = await Report.countDocuments({ status: 'pending' })
    const recentPending = await Ad.find({ status: 'pending', isDeletedByUser: false })
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).json({
      success: true,
      totalUsers, totalAds, pendingAds, activeAds,
      soldAds, deletedAds, totalReports, recentPending,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}

    if (status === 'deleted') {
      query.isDeletedByUser = true
    } else if (status === 'sold') {
      query.status = 'sold'
      query.isDeletedByUser = false
    } else if (status) {
      query.status = status
      query.isDeletedByUser = false
    }

    const total = await Ad.countDocuments(query)
    const ads = await Ad.find(query)
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true, ads,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body
    const updateData = { status }
    if (status === 'active' || status === 'rejected') {
      updateData.hasUpdate = false
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('seller', 'name phone email')

    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    if (status === 'active') {
      await createNotification(ad.seller._id, '✅ Ad Approved!', 'Your ad "' + ad.title + '" has been approved and is now live.', 'ad_approved', `/ads/${ad._id}`)
    } else if (status === 'rejected') {
      await createNotification(ad.seller._id, '❌ Ad Rejected', 'Your ad "' + ad.title + '" has been rejected. Please review and repost.', 'ad_rejected', `/ads/${ad._id}`)
    }

    await ActivityLog.create({
      performedBy: req.user._id,
      action: status === 'active' ? 'approve_ad' : 'reject_ad',
      details: `${status === 'active' ? 'Approved' : 'Rejected'} ad: "${ad.title}" (Seller: ${ad.seller?.email || 'N/A'})`
    })

    return res.status(200).json({ success: true, ad })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { reason } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (['admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' })
    }

    await Ad.updateMany({ seller: user._id }, { isDeletedByUser: true })
    await User.findByIdAndDelete(req.params.id)

    await ActivityLog.create({
      performedBy: req.user._id,
      action: 'delete_user',
      details: `Deleted user: ${user.email} — Reason: ${reason || 'No reason provided'}`
    })

    return res.status(200).json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}




const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const total = await User.countDocuments()
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true, users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { isActive, reason } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, blockReason: isActive ? '' : (reason || 'Violated community guidelines') },
      { new: true }
    ).select('-__v')

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    await createNotification(
      user._id,
      isActive ? '✅ Account Activated' : '🚫 Account Blocked',
      isActive ? 'Your account has been activated.' : `Your account has been blocked. Reason: ${reason || 'Violated community guidelines'}`,
      'general', '/'
    )

    await ActivityLog.create({
      performedBy: req.user._id,
      action: isActive ? 'unblock_user' : 'block_user',
      targetUser: user._id,
      details: isActive ? `Unblocked user: ${user.email}` : `Blocked user: ${user.email} — Reason: ${reason || 'Violated community guidelines'}`
    })

    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status

    const total = await Report.countDocuments(query)
    const reports = await Report.find(query)
      .populate('ad', 'title images')
      .populate('reportedBy', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true, reports,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    return res.status(200).json({ success: true, report })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-__v')

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}


// Admin Management — sirf super-admin ke liye

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } })
      .select('-password -__v')
      .sort({ createdAt: -1 })
    return res.status(200).json({ success: true, admins })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const addAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await User.create({
      firstName, lastName: lastName || '',
      email, password: hashedPassword,
      role: 'admin', isActive: true,
      isEmailVerified: true, totalAds: 0,
    })

    // Activity log
    await ActivityLog.create({
      performedBy: req.user._id,
      action: 'add_admin',
      targetUser: admin._id,
      details: `Added new admin: ${email}`
    })

    return res.status(201).json({ success: true, admin: { ...admin.toObject(), password: undefined } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
    if (admin.role === 'super-admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete super admin' })
    }

    await User.findByIdAndDelete(req.params.id)

    await ActivityLog.create({
      performedBy: req.user._id,
      action: 'delete_admin',
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
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const admin = await User.findById(req.params.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
    if (admin.role === 'super-admin') {
      return res.status(403).json({ success: false, message: 'Cannot reset super admin password' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword })

    await ActivityLog.create({
      performedBy: req.user._id,
      action: 'reset_password',
      targetUser: admin._id,
      details: `Reset password for admin: ${admin.email}`
    })

    return res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query
    const total = await ActivityLog.countDocuments()
    const logs = await ActivityLog.find()
      .populate('performedBy', 'firstName lastName email role')
      .populate('targetUser', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({ success: true, logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  getDashboard,
  getAllAds,
  updateAdStatus,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  updateUserRole,
  getAllReports,
  updateReportStatus,
  getAdmins,
  addAdmin,
  deleteAdmin,
  resetAdminPassword,
  getActivityLogs,
}