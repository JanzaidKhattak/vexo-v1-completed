const mongoose = require('mongoose')

const sectionSchema = new mongoose.Schema({
  icon: { type: String, default: '📌' },
  title: { type: String, required: true },
  content: { type: String, required: true },
})

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // 'terms', 'privacy-policy', 'help'
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String }, // 'Legal', 'Support' etc
  sections: [sectionSchema],
}, { timestamps: true })

module.exports = mongoose.model('Page', pageSchema)