const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  performedById: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM(
      'add_admin', 'delete_admin', 'reset_password',
      'approve_ad', 'reject_ad', 'block_user', 'unblock_user',
      'delete_user', 'update_settings', 'update_role'
    ),
    allowNull: false,
  },
  targetUserId: { type: DataTypes.UUID, allowNull: true },
  details: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  tableName: 'activity_logs',
  timestamps: true,
})

module.exports = ActivityLog