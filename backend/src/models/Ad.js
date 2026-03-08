const mongoose = require('mongoose')

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cars', 'motorcycles', 'mobiles', 'electronics', 'furniture', 'furniture-home', 'fashion', 'fashion-beauty', 'others']
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    default: 'Attock'
  },
  area: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'sold'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  isDeletedByUser: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  soldAt: {
    type: Date,
    default: null
  },
  hasUpdate: {
    type: Boolean,
    default: false
  },
  updateHistory: [{
    updatedAt: { type: Date, default: Date.now },
    changes: {
      title: { old: String, new: String },
      description: { old: String, new: String },
      price: { old: Number, new: Number },
      area: { old: String, new: String },
    }
  }]

}, {
  timestamps: true
})

adSchema.index({ title: 'text', description: 'text' })
adSchema.index({ category: 1, status: 1 })
adSchema.index({ seller: 1 })
adSchema.index({ isDeletedByUser: 1 })

module.exports = mongoose.model('Ad', adSchema)