const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: { type: String, trim: true, default: '' },
  lastName: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  password: { type: String, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },

  // Auth
  googleId: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyOtp: { type: String, default: '' },
  emailVerifyOtpExpiry: { type: Date, default: null },

  // Password Reset
  resetPasswordOtp: { type: String, default: '' },
  resetPasswordOtpExpiry: { type: Date, default: null },

  // Role & Status
role: { type: String, enum: ['user', 'admin', 'super-admin'], default: 'user' },
isActive: { type: Boolean, default: true },
blockReason: { type: String, default: '' },
isDeleted: { type: Boolean, default: false },
deletedAt: { type: Date, default: null },

  // Legacy
  location: { type: String, default: 'Attock' },
  totalAds: { type: Number, default: 0 },

}, { timestamps: true })

// Virtual — full name
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`.trim() || 'User'
})

module.exports = mongoose.model('User', userSchema)