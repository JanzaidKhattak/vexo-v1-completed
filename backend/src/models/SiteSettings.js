const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const SiteSettings = sequelize.define('SiteSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  siteName: { type: DataTypes.STRING, defaultValue: 'Vexo' },
  logoUrl: { type: DataTypes.STRING, defaultValue: '' },
  faviconUrl: { type: DataTypes.STRING, defaultValue: '' },
  heroBannerImage: { type: DataTypes.STRING, defaultValue: '' },
  heroHeading: { type: DataTypes.STRING, defaultValue: 'Buy & Sell Anything in Attock' },
  heroSubheading: { type: DataTypes.STRING, defaultValue: 'Find great deals near you' },
  heroButtonText: { type: DataTypes.STRING, defaultValue: 'Browse Ads' },
  whatsappNumber: { type: DataTypes.STRING, defaultValue: '' },
  facebookUrl: { type: DataTypes.STRING, defaultValue: '' },
  instagramUrl: { type: DataTypes.STRING, defaultValue: '' },
  youtubeUrl: { type: DataTypes.STRING, defaultValue: '' },
  twitterUrl: { type: DataTypes.STRING, defaultValue: '' },
  supportEmail: { type: DataTypes.STRING, defaultValue: '' },
  supportWhatsapp: { type: DataTypes.STRING, defaultValue: '' },
  footerAddress: { type: DataTypes.STRING, defaultValue: 'Attock, Pakistan' },
  chatButtonEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  chatButtonNumber: { type: DataTypes.STRING, defaultValue: '' },
  categories: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify([
      { id: 'mobiles',     name: 'Mobiles',         icon: '📱', slug: 'mobiles',     isActive: true, showOnHome: true, parentId: null, order: 0 },
      { id: 'cars',        name: 'Cars',             icon: '🚗', slug: 'cars',        isActive: true, showOnHome: true, parentId: null, order: 1 },
      { id: 'motorcycles', name: 'Motorcycles',      icon: '🏍️', slug: 'motorcycles', isActive: true, showOnHome: true, parentId: null, order: 2 },
      { id: 'electronics', name: 'Electronics',      icon: '💻', slug: 'electronics', isActive: true, showOnHome: true, parentId: null, order: 3 },
      { id: 'furniture',   name: 'Furniture & Home', icon: '🛋️', slug: 'furniture',   isActive: true, showOnHome: true, parentId: null, order: 4 },
      { id: 'fashion',     name: 'Fashion & Beauty', icon: '👗', slug: 'fashion',     isActive: true, showOnHome: true, parentId: null, order: 5 },
      { id: 'others',      name: 'Others',           icon: '📦', slug: 'others',      isActive: true, showOnHome: true, parentId: null, order: 6 },
    ]),
    get() {
      const val = this.getDataValue('categories')
      try { return JSON.parse(val) } catch { return [] }
    },
    set(val) {
      this.setDataValue('categories', JSON.stringify(val))
    },
  },
}, {
  tableName: 'site_settings',
  timestamps: true,
})

module.exports = SiteSettings