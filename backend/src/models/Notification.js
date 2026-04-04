const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('ad_approved', 'ad_rejected', 'ad_sold', 'new_report', 'general', 'ad_status', 'report', 'warning'),
    defaultValue: 'general',
  },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING, defaultValue: '' },
}, {
  tableName: 'notifications',
  timestamps: true,
})

module.exports = Notification