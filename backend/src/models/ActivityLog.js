const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
  'add_admin',
  'delete_admin',
  'reset_password',
  'approve_ad',
  'reject_ad',
  'block_user',
  'unblock_user',
  'delete_user',
  'update_settings',
  'update_role',
],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  details: {
    type: String,
    default: ''
  },
}, { timestamps: true })

module.exports = mongoose.model('ActivityLog', activityLogSchema)