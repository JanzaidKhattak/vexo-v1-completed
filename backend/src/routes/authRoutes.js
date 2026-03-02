const express = require('express')
const router = express.Router()
const { verifyOtp, getMe } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/verify-otp', verifyOtp)
router.get('/me', authenticate, getMe)

module.exports = router