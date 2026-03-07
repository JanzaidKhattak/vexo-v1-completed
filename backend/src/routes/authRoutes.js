const express = require('express')
const router = express.Router()
const passport = require('passport')
const {
  register,
  login,
  googleCallback,
  sendVerifyOtp,
  verifyEmail,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

// Email/Password
router.post('/register', register)
router.post('/login', login)

// Forgot Password
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`, session: false }),
  googleCallback
)

// Email Verification
router.post('/send-verify-otp', authenticate, sendVerifyOtp)
router.post('/verify-email', authenticate, verifyEmail)

// Get current user
router.get('/me', authenticate, getMe)

module.exports = router