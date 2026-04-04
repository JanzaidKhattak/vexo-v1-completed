const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { User } = require('../models/index')

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

    let user = await User.findOne({ where: { email } })

    if (user) {
      if (!user.googleId) {
        await user.update({ googleId, isEmailVerified: true, avatar: user.avatar || avatar })
      }
      return done(null, user)
    }

    user = await User.create({
      firstName, lastName, email, googleId,
      avatar, isEmailVerified: true,
    })

    return done(null, user)
  } catch (error) {
    console.error('Google OAuth error:', error)
    return done(error, null)
  }
}))

module.exports = passport