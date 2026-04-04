const { Notification } = require('../models/index')

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    })

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    })

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.set('Pragma', 'no-cache')

    return res.status(200).json({ success: true, notifications, unreadCount })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    )
    return res.status(200).json({ success: true, message: 'Marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    )
    return res.status(200).json({ success: true, message: 'All marked as read' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const createNotification = async (userId, title, message, type = 'general', link = '') => {
  try {
    await Notification.create({ userId, title, message, type, link })
  } catch (error) {
    console.error('Notification error:', error)
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification }