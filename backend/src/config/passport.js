 
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value
    const googleId = profile.id
    const firstName = profile.name?.givenName || ''
    const lastName = profile.name?.familyName || ''
    const avatar = profile.photos?.[0]?.value || ''

    // Pehle email se dhundo
    let user = await User.findOne({ email })

    if (user) {
      // Existing user — googleId update karo agar nahi hai
      if (!user.googleId) {
        user.googleId = googleId
        user.isEmailVerified = true
        if (!user.avatar) user.avatar = avatar
        await user.save()
      }
      return done(null, user)
    }

    // New user banao
    user = await User.create({
      firstName,
      lastName,
      email,
      googleId,
      avatar,
      isEmailVerified: true, // Google se verified hai
    })

    return done(null, user)
  } catch (error) {
    console.error('Google OAuth error:', error)
    return done(error, null)
  }
}))

module.exports = passport