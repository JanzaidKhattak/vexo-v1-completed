const admin = require('../config/firebase')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyOtp = async (req, res) => {
  try {
    const { idToken, phone } = req.body

    if (!idToken || !phone) {
      return res.status(400).json({ success: false, message: 'idToken and phone required' })
    }

    // Firebase token verify karo
    const decodedToken = await admin.auth().verifyIdToken(idToken)

    if (!decodedToken.phone_number) {
      return res.status(400).json({ success: false, message: 'Invalid token' })
    }

    // User dhundo ya banao
    let user = await User.findOne({ phone })

    if (!user) {
      user = await User.create({ phone })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account blocked' })
    }

    // JWT token banao
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        location: user.location
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ success: false, message: 'Authentication failed' })
  }
}

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v')
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { verifyOtp, getMe }