const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Resend } = require('resend')
const axios = require('axios')
const User = require('../models/User')
const BlacklistedEmail = require('../models/BlacklistedEmail')

// Email transporter
const resend = new Resend(process.env.RESEND_API_KEY)

// JWT generate
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// OTP generate (6 digits)
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// User response format
const userResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  avatar: user.avatar,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  location: user.location,
  totalAds: user.totalAds,
})

// Verify reCAPTCHA
const verifyRecaptcha = async (token) => {
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    { params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token } }
  )
  return res.data.success
}

// Register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, recaptchaToken } = req.body

    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, email and password are required' })
    }

    // reCAPTCHA verify
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: 'Please complete the reCAPTCHA' })
    }
    const captchaValid = await verifyRecaptcha(recaptchaToken)
    if (!captchaValid) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' })
    }

    // Blacklist check
const blacklisted = await BlacklistedEmail.findOne({ email })
if (blacklisted) {
  return res.status(403).json({ 
    success: false, 
    message: `This email has been permanently suspended from VEXO. Reason: ${blacklisted.reason}`,
    suspended: true
  })
}

    // Email already exists?
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000) // 2 min

    const user = await User.create({
      firstName,
      lastName: lastName || '',
      email,
      password: hashedPassword,
      emailVerifyOtp: otp,
      emailVerifyOtpExpiry: otpExpiry,
    })

    // Send verification email
    await resend.emails.send({
      from: 'Vexo <noreply@toolscorner.net>',
      to: email,
      subject: 'Verify your Vexo account',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Welcome to Vexo! 👋</h2>
          <p style="color: #6B7280; margin-bottom: 24px;">Use the code below to verify your email address. This code expires in <strong>2 minutes</strong>.</p>
          <div style="background: white; border: 2px solid #E5E7EB; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6C3AF5; margin: 0;">${otp}</p>
          </div>
          <p style="color: #9CA3AF; font-size: 13px;">If you did not create a Vexo account, please ignore this email.</p>
        </div>
      `
    })

    const token = generateToken(user._id)
    return res.status(201).json({ success: true, token, user: userResponse(user) })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Login
const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // reCAPTCHA verify — skip for admin bypass
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: 'Please complete the reCAPTCHA' })
    }

    if (recaptchaToken !== 'admin-bypass') {
      const captchaValid = await verifyRecaptcha(recaptchaToken)
      if (!captchaValid) {
        return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' })
      }
    }

    // Blacklist check
const blacklisted = await BlacklistedEmail.findOne({ email })
if (blacklisted) {
  return res.status(403).json({ 
    success: false, 
    message: `Your account has been permanently suspended. Reason: ${blacklisted.reason}`,
    suspended: true
  })
}

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    }

    if (!user.isActive) {
  return res.status(403).json({ 
    success: false, 
    message: user.blockReason 
      ? `Your account has been blocked. Reason: ${user.blockReason}` 
      : 'Your account has been blocked. Please contact support.',
    blocked: true
  })
}

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)
    return res.status(200).json({ success: true, token, user: userResponse(user) })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const user = req.user
    const token = generateToken(user._id)
    // Frontend pe redirect with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse(user)))}`)
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`)
  }
}

// Send verify OTP
const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000)

    user.emailVerifyOtp = otp
    user.emailVerifyOtpExpiry = otpExpiry
    await user.save()

    await resend.emails.send({
      from: 'Vexo <noreply@toolscorner.net>',
      to: user.email,
      subject: 'Verify your Vexo email',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #6B7280; margin-bottom: 24px;">Use the code below to verify your email. Expires in <strong>2 minutes</strong>.</p>
          <div style="background: white; border: 2px solid #E5E7EB; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6C3AF5; margin: 0;">${otp}</p>
          </div>
        </div>
      `
    })

    return res.status(200).json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return res.status(500).json({ success: false, message: 'Failed to send verification email' })
  }
}

// Verify email OTP
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await User.findById(req.user._id)

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    if (!user.emailVerifyOtp || user.emailVerifyOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' })
    }

    if (new Date() > user.emailVerifyOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' })
    }

    user.isEmailVerified = true
    user.emailVerifyOtp = ''
    user.emailVerifyOtpExpiry = null
    await user.save()

    return res.status(200).json({ success: true, message: 'Email verified successfully!' })
  } catch (error) {
    console.error('Verify email error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Get me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerifyOtp -emailVerifyOtpExpiry -resetPasswordOtp -resetPasswordOtpExpiry')
    return res.status(200).json({ success: true, user: userResponse(user) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}


// Forgot Password — 
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) {
      // Security: same message dete hain chahe user ho ya na ho
      return res.status(200).json({ success: true, message: 'If this email exists, a reset code has been sent' })
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpiry = otpExpiry
    await user.save()

    await resend.emails.send({
      from: 'Vexo <noreply@toolscorner.net>',
      to: email,
      subject: 'Reset your Vexo password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Reset Password 🔐</h2>
          <p style="color: #6B7280; margin-bottom: 24px;">Use the code below to reset your password. Expires in <strong>10 minutes</strong>.</p>
          <div style="background: white; border: 2px solid #E5E7EB; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6C3AF5; margin: 0;">${otp}</p>
          </div>
          <p style="color: #9CA3AF; font-size: 13px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    })

    return res.status(200).json({ success: true, message: 'If this email exists, a reset code has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Reset Password — new password set karo
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({ email })
    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid reset code' })
    }

    if (new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    user.resetPasswordOtp = ''
    user.resetPasswordOtpExpiry = null
    await user.save()

    return res.status(200).json({ success: true, message: 'Password reset successfully! Please login.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { register, login, googleCallback, sendVerifyOtp, verifyEmail, getMe, forgotPassword, resetPassword }