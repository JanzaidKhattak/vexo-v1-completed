const Notification = require('../models/Notification')

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    })

    return res.status(200).json({ success: true, notifications, unreadCount })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    )
    return res.status(200).json({ success: true, message: 'Marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    )
    return res.status(200).json({ success: true, message: 'All marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const createNotification = async (userId, title, message, type = 'general', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link })
  } catch (error) {
    console.error('Notification error:', error)
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification }