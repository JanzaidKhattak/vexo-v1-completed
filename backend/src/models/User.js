const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: { type: DataTypes.STRING, defaultValue: '' },
  lastName: { type: DataTypes.STRING, defaultValue: '' },
  email: { type: DataTypes.STRING, unique: true, allowNull: true },
  password: { type: DataTypes.STRING, defaultValue: '' },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, defaultValue: '' },
  avatar: { type: DataTypes.STRING, defaultValue: '' },

  googleId: { type: DataTypes.STRING, defaultValue: '' },
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerifyOtp: { type: DataTypes.STRING, defaultValue: '' },
  emailVerifyOtpExpiry: { type: DataTypes.DATE, allowNull: true },

  resetPasswordOtp: { type: DataTypes.STRING, defaultValue: '' },
  resetPasswordOtpExpiry: { type: DataTypes.DATE, allowNull: true },

  role: {
    type: DataTypes.ENUM('user', 'admin', 'super-admin'),
    defaultValue: 'user',
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  blockReason: { type: DataTypes.STRING, defaultValue: '' },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt: { type: DataTypes.DATE, allowNull: true },

  location: { type: DataTypes.STRING, defaultValue: 'Attock' },
  totalAds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'users',
  timestamps: true,
})

// Virtual — full name
User.prototype.getName = function () {
  return `${this.firstName} ${this.lastName}`.trim() || 'User'
}

module.exports = User