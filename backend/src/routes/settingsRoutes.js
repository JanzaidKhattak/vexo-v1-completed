const express = require('express')
const router = express.Router()
const { getSettings, updateSettings } = require('../controllers/settingsController')
const { authenticate, isAdmin } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

// catIcon_0 to catIcon_29 — max 30 categories support
const catIconFields = Array.from({ length: 30 }, (_, i) => ({
  name: `catIcon_${i}`, maxCount: 1,
}))

const uploadFields = upload.fields([
  { name: 'logo',       maxCount: 1 },
  { name: 'favicon',    maxCount: 1 },
  { name: 'heroBanner', maxCount: 1 },
  ...catIconFields,
])

router.get('/', getSettings)
router.put('/', authenticate, isAdmin, uploadFields, updateSettings)

module.exports = router