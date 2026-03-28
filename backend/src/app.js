require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const passport = require('./config/passport')

const authRoutes = require('./routes/authRoutes')
const adRoutes = require('./routes/adRoutes')
const userRoutes = require('./routes/userRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const adminRoutes = require('./routes/adminRoutes')
const reportRoutes = require('./routes/reportRoutes')

const app = express()

app.use(helmet())

const allowedOrigins = [
  'https://vexoonline.vercel.app',
  'https://www.vexoonline.vercel.app',
  'http://localhost:3000',
  'https://vexoo.online',       
  'https://www.vexoo.online',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vexo API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/ads', adRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/pages', require('./routes/pages'))
app.use('/api/settings', require('./routes/settingsRoutes'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

module.exports = app