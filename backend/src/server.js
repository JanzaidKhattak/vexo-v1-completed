require('dotenv').config()
const { connectDB } = require('./config/db')
const { User, Ad, Notification, Report, ActivityLog, BlacklistedEmail, Page, SiteSettings } = require('./models/index')
const app = require('./app')

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})