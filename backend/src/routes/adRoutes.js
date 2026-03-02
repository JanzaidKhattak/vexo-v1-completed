const express = require('express')
const router = express.Router()
const {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getTrendingAds,
  getRecentAds,
  markAsSold
} = require('../controllers/adController')
const { authenticate } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.get('/trending', getTrendingAds)
router.get('/recent', getRecentAds)
router.get('/', getAds)
router.get('/:id', getAdById)
router.post('/', authenticate, upload.array('images', 5), createAd)
router.put('/:id', authenticate, upload.array('images', 5), updateAd)
router.delete('/:id', authenticate, deleteAd)
router.patch('/:id/sold', authenticate, markAsSold)

module.exports = router