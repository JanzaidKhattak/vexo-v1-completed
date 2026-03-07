 
const express = require('express')
const router = express.Router()
const { getSettings, updateSettings } = require('../controllers/settingsController')
const { authenticate, isAdmin } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'heroBanner', maxCount: 1 },
])

router.get('/', getSettings)
router.put('/', authenticate, isAdmin, uploadFields, updateSettings)

module.exports = router