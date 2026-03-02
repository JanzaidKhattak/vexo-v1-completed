const express = require('express')
const router = express.Router()
const { getProfile, updateProfile, getUserAds, getPublicProfile } = require('../controllers/userController')
const { authenticate } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, upload.single('avatar'), updateProfile)
router.get('/my-ads', authenticate, getUserAds)
router.get('/:id', getPublicProfile)

module.exports = router