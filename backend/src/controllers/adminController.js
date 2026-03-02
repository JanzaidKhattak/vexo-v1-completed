const Ad = require('../models/Ad')
const User = require('../models/User')
const Report = require('../models/Report')
const { createNotification } = require('./notificationController')

const getDashboard = async (req, res) => {
  try {
    const totalAds = await Ad.countDocuments()
    const pendingAds = await Ad.countDocuments({ status: 'pending' })
    const activeAds = await Ad.countDocuments({ status: 'active' })
    const totalUsers = await User.countDocuments()
    const totalReports = await Report.countDocuments({ status: 'pending' })
    const recentPending = await Ad.find({ status: 'pending' })
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).json({
      success: true,
      totalUsers,
      totalAds,
      pendingAds,
      activeAds,
      totalReports,
      recentPending,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAllAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status

    const total = await Ad.countDocuments(query)
    const ads = await Ad.find(query)
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      ads,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('seller', 'name phone')

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    if (status === 'active') {
      await createNotification(
        ad.seller._id,
        'Ad Approved! ✅',
        `Your ad "${ad.title}" has been approved and is now live.`,
        'ad_approved',
        `/ads/${ad._id}`
      )
    } else if (status === 'rejected') {
      await createNotification(
        ad.seller._id,
        'Ad Rejected ❌',
        `Your ad "${ad.title}" has been rejected.`,
        'ad_rejected',
        `/ads/${ad._id}`
      )
    }

    return res.status(200).json({ success: true, ad })
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
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-__v')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

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
      success: true,
      reports,
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

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    return res.status(200).json({ success: true, report })
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
  getAllReports,
  updateReportStatus
}