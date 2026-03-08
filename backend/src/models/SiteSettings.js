const mongoose = require('mongoose')

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Vexo' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  heroBannerImage: { type: String, default: '' },
  heroHeading: { type: String, default: 'Buy & Sell Anything in Attock' },
  heroSubheading: { type: String, default: 'Find great deals near you' },
  heroButtonText: { type: String, default: 'Browse Ads' },
  primaryColor: { type: String, default: '#6C3AF5' },
  secondaryColor: { type: String, default: '#F59E0B' },
  fontFamily: { type: String, default: 'Inter' },
  whatsappNumber: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  supportWhatsapp: { type: String, default: '' },
  footerAddress: { type: String, default: 'Attock, Pakistan' },
  categories: {
    type: [{
      id:          String,
      name:        String,
      icon:        String,
      iconUrl:     { type: String, default: '' },
      iconSize:    { type: Number, default: 28 },
      slug:        String,
      isActive:    { type: Boolean, default: true },
      showOnHome:  { type: Boolean, default: true },  // ← NEW
    }],
    default: [
      { id: 'mobiles',      name: 'Mobiles',          icon: '📱', slug: 'mobiles',      isActive: true, showOnHome: true },
      { id: 'cars',         name: 'Cars',              icon: '🚗', slug: 'cars',         isActive: true, showOnHome: true },
      { id: 'motorcycles',  name: 'Motorcycles',       icon: '🏍️', slug: 'motorcycles',  isActive: true, showOnHome: true },
      { id: 'electronics',  name: 'Electronics',       icon: '💻', slug: 'electronics',  isActive: true, showOnHome: true },
      { id: 'furniture',    name: 'Furniture & Home',  icon: '🛋️', slug: 'furniture',    isActive: true, showOnHome: true },
      { id: 'fashion',      name: 'Fashion & Beauty',  icon: '👗', slug: 'fashion',      isActive: true, showOnHome: true },
      { id: 'others',       name: 'Others',            icon: '📦', slug: 'others',       isActive: true, showOnHome: true },
    ]
  },
  chatButtonEnabled: { type: Boolean, default: true },
  chatButtonNumber:  { type: String,  default: '' },
}, { timestamps: true })

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)