const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Offensive content', 'Fraud', 'Duplicate ad', 'Product already sold',
      'Wrong category', 'Product unavailable', 'Fake product', 'Indecent', 'Other',
      'spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'other'
    ]
  },
  comment: { type: String, default: '' },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminAction: {
    type: String,
    enum: ['none', 'ad_blocked', 'ad_unblocked', 'user_blocked', 'warned', 'ignored'],
    default: 'none'
  },
  actionNote: { type: String, default: '' },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actionAt: { type: Date, default: null }
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)