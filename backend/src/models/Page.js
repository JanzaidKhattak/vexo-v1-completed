const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, defaultValue: '' },
  badge: { type: DataTypes.STRING, defaultValue: '' },
  sections: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('sections')
      try { return JSON.parse(val) } catch { return [] }
    },
    set(val) {
      this.setDataValue('sections', JSON.stringify(val))
    },
  },
}, {
  tableName: 'pages',
  timestamps: true,
})

module.exports = Page