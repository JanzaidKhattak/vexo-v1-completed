const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const BlacklistedEmail = sequelize.define('BlacklistedEmail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  reason: { type: DataTypes.STRING, defaultValue: 'Policy violation' },
  deletedById: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'blacklisted_emails',
  timestamps: true,
})

module.exports = BlacklistedEmail