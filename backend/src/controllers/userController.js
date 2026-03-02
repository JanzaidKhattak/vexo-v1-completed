const User = require('../models/User')
const Ad = require('../models/Ad')

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v')
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name, email, location } = req.body

    const avatar = req.file ? req.file.path : undefined

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (location) updateData.location = location
    if (avatar) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-__v')

    return res.status(200).json({ success: true, user })
  } catch (error) {
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
      success: true,
      ads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar location totalAds createdAt')

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