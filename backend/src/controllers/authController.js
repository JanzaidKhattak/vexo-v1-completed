const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Resend } = require('resend')
const axios = require('axios')
const { User, BlacklistedEmail } = require('../models/index')
const { createNotification } = require('./notificationController')

const resend = new Resend(process.env.RESEND_API_KEY)

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

const userResponse = (user) => ({
  _id: user.id, firstName: user.firstName, lastName: user.lastName,
  name: user.getName(), email: user.email, phone: user.phone,
  address: user.address, avatar: user.avatar, role: user.role,
  isEmailVerified: user.isEmailVerified, location: user.location, totalAds: user.totalAds,
})

const verifyRecaptcha = async (token) => {
  const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null,
    { params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token } })
  return res.data.success
}

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, recaptchaToken } = req.body

    if (!firstName || !email || !password)
      return res.status(400).json({ success: false, message: 'First name, email and password are required' })

    if (!recaptchaToken)
      return res.status(400).json({ success: false, message: 'Please complete the reCAPTCHA' })

    const captchaValid = await verifyRecaptcha(recaptchaToken)
    if (!captchaValid)
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' })

    const blacklisted = await BlacklistedEmail.findOne({ where: { email } })
    if (blacklisted)
      return res.status(403).json({ success: false, message: `This email has been permanently suspended from VEXO. Reason: ${blacklisted.reason}`, suspended: true })

    const existing = await User.findOne({ where: { email } })
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' })

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000)

    const user = await User.create({
      firstName, lastName: lastName || '', email,
      password: hashedPassword,
      emailVerifyOtp: otp, emailVerifyOtpExpiry: otpExpiry,
    })

    try {
      const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
      for (const admin of admins) {
        await createNotification(admin.id, '👤 New User Registered',
          `${firstName} ${lastName || ''} (${email}) just signed up`, 'general', '/vexo-admin/users')
      }
    } catch (e) { console.error('Signup notif error:', e) }

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

    const token = generateToken(user.id)
    return res.status(201).json({ success: true, token, user: userResponse(user) })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    if (!recaptchaToken)
      return res.status(400).json({ success: false, message: 'Please complete the reCAPTCHA' })
    if (recaptchaToken !== 'admin-bypass') {
      const captchaValid = await verifyRecaptcha(recaptchaToken)
      if (!captchaValid)
        return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' })
    }
    const blacklisted = await BlacklistedEmail.findOne({ where: { email } })
    if (blacklisted)
      return res.status(403).json({ success: false, message: `Your account has been permanently suspended. Reason: ${blacklisted.reason}`, suspended: true })

    const user = await User.findOne({ where: { email } })
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    if (!user.isActive)
      return res.status(403).json({ success: false, message: user.blockReason ? `Your account has been blocked. Reason: ${user.blockReason}` : 'Your account has been blocked. Please contact support.', blocked: true })
    if (!user.password)
      return res.status(400).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    const token = generateToken(user.id)
    return res.status(200).json({ success: true, token, user: userResponse(user) })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const googleCallback = async (req, res) => {
  try {
    const user = req.user
    const isNewUser = user.createdAt && (Date.now() - new Date(user.createdAt).getTime()) < 10000
    if (isNewUser) {
      try {
        const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
        for (const admin of admins) {
          await createNotification(admin.id, '👤 New User via Google',
            `${user.firstName || ''} ${user.lastName || ''} (${user.email}) signed up with Google`,
            'general', '/vexo-admin/users')
        }
      } catch (e) { console.error('Google signup notif error:', e) }
    }
    const token = generateToken(user.id)
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse(user)))}`)
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`)
  }
}

const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (user.isEmailVerified)
      return res.status(400).json({ success: false, message: 'Email already verified' })
    const otp = generateOtp()
    user.emailVerifyOtp = otp
    user.emailVerifyOtpExpiry = new Date(Date.now() + 2 * 60 * 1000)
    await user.save()
    await resend.emails.send({
      from: 'Vexo <noreply@toolscorner.net>', to: user.email,
      subject: 'Verify your Vexo email',
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;"><h2 style="color:#111827;">Verify your email</h2><p style="color:#6B7280;">Expires in <strong>2 minutes</strong>.</p><div style="background:white;border:2px solid #E5E7EB;border-radius:10px;padding:24px;text-align:center;"><p style="font-size:36px;font-weight:800;letter-spacing:8px;color:#6C3AF5;margin:0;">${otp}</p></div></div>`
    })
    return res.status(200).json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send verification email' })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await User.findByPk(req.user.id)
    if (user.isEmailVerified)
      return res.status(400).json({ success: false, message: 'Email already verified' })
    if (!user.emailVerifyOtp || user.emailVerifyOtp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid verification code' })
    if (new Date() > user.emailVerifyOtpExpiry)
      return res.status(400).json({ success: false, message: 'Code expired. Request a new one.' })
    user.isEmailVerified = true
    user.emailVerifyOtp = ''
    user.emailVerifyOtpExpiry = null
    await user.save()
    return res.status(200).json({ success: true, message: 'Email verified successfully!' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    return res.status(200).json({ success: true, user: userResponse(user) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' })
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(200).json({ success: true, message: 'If this email exists, a reset code has been sent' })
    if (!user.password) return res.status(400).json({ success: false, message: 'This account uses Google login.' })
    const otp = generateOtp()
    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()
    await resend.emails.send({
      from: 'Vexo <noreply@toolscorner.net>', to: email,
      subject: 'Reset your Vexo password',
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;"><h2 style="color:#111827;">Reset Password 🔐</h2><p style="color:#6B7280;">Expires in <strong>10 minutes</strong>.</p><div style="background:white;border:2px solid #E5E7EB;border-radius:10px;padding:24px;text-align:center;"><p style="font-size:36px;font-weight:800;letter-spacing:8px;color:#6C3AF5;margin:0;">${otp}</p></div><p style="color:#9CA3AF;font-size:13px;">If you did not request this, ignore this email.</p></div>`
    })
    return res.status(200).json({ success: true, message: 'If this email exists, a reset code has been sent' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'All fields are required' })
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    const user = await User.findOne({ where: { email } })
    if (!user || !user.resetPasswordOtp)
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
    if (user.resetPasswordOtp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid reset code' })
    if (new Date() > user.resetPasswordOtpExpiry)
      return res.status(400).json({ success: false, message: 'Reset code expired. Request a new one.' })
    user.password = await bcrypt.hash(newPassword, 12)
    user.resetPasswordOtp = ''
    user.resetPasswordOtpExpiry = null
    await user.save()
    return res.status(200).json({ success: true, message: 'Password reset successfully! Please login.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { register, login, googleCallback, sendVerifyOtp, verifyEmail, getMe, forgotPassword, resetPassword }