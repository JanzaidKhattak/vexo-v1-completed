const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const isAdmin = (req, res, next) => {
  if (!['admin', 'super-admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super-admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' })
  }
  next()
}

module.exports = { authenticate, isAdmin, isSuperAdmin }