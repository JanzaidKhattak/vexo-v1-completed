const mongoose = require('mongoose')

const blacklistedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  reason: { type: String, default: 'Policy violation' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('BlacklistedEmail', blacklistedEmailSchema)