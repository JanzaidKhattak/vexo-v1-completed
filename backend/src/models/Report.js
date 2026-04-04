const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  adId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reportedById: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reason: {
    type: DataTypes.ENUM(
      'Offensive content', 'Fraud', 'Duplicate ad', 'Product already sold',
      'Wrong category', 'Product unavailable', 'Fake product', 'Indecent', 'Other',
      'spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'other'
    ),
    allowNull: false,
  },
  comment: { type: DataTypes.TEXT, defaultValue: '' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  adminAction: {
    type: DataTypes.ENUM('none', 'ad_blocked', 'ad_unblocked', 'user_blocked', 'warned', 'ignored'),
    defaultValue: 'none',
  },
  actionNote: { type: DataTypes.TEXT, defaultValue: '' },
  actionById: { type: DataTypes.UUID, allowNull: true },
  actionAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'reports',
  timestamps: true,
})

module.exports = Report