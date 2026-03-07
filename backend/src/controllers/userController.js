const User = require('../models/User')
const Ad = require('../models/Ad')
const { cloudinary } = require('../config/cloudinary')

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerifyOtp -emailVerifyOtpExpiry -resetPasswordOtp -resetPasswordOtpExpiry -__v')
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' })
    }

    const updateData = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    // Avatar upload
    if (req.file) {
      // Old avatar delete karo Cloudinary se
      const currentUser = await User.findById(req.user._id)
      if (currentUser.avatar) {
        const publicId = currentUser.avatar.split('/').slice(-2).join('/').split('.')[0]
        await cloudinary.uploader.destroy(publicId).catch(() => {})
      }
      updateData.avatar = req.file.path
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -emailVerifyOtp -emailVerifyOtpExpiry -__v')

    return res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getUserAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const query = { seller: req.user._id }
    if (status) query.status = status

    const total = await Ad.countDocuments(query)
    const ads = await Ad.find(query)
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

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName avatar location totalAds createdAt isEmailVerified')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const ads = await Ad.find({ seller: req.params.id, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)

    return res.status(200).json({ success: true, user, ads })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { getProfile, updateProfile, getUserAds, getPublicProfile }