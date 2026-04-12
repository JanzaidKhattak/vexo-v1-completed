const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  category: {
    type: DataTypes.ENUM('cars', 'motorcycles', 'mobiles', 'electronics', 'furniture', 'furniture-home', 'fashion', 'fashion-beauty', 'others'),
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('images')
      try { return JSON.parse(val) } catch { return [] }
    },
    set(val) {
      this.setDataValue('images', JSON.stringify(val))
    },
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  location: { type: DataTypes.STRING, defaultValue: 'Pakistan' },
  area: { type: DataTypes.STRING, defaultValue: '' },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'rejected', 'sold', 'blocked'),
    defaultValue: 'pending',
  },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
featuredUntil: { type: DataTypes.DATE, allowNull: true },
featuredDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  details: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const val = this.getDataValue('details')
      try { return JSON.parse(val) } catch { return {} }
    },
    set(val) {
      this.setDataValue('details', JSON.stringify(val))
    },
  },
  isDeletedByUser: { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
  soldAt: { type: DataTypes.DATE, allowNull: true },
  hasUpdate: { type: DataTypes.BOOLEAN, defaultValue: false },
  updateHistory: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('updateHistory')
      try { return JSON.parse(val) } catch { return [] }
    },
    set(val) {
      this.setDataValue('updateHistory', JSON.stringify(val))
    },
  },
  blockReason: { type: DataTypes.STRING, allowNull: true },
  blockedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'ads',
  timestamps: true,
})

module.exports = Ad