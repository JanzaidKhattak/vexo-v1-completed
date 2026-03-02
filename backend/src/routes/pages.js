const express = require('express')
const router = express.Router()
const { getPage, getAllPages, upsertPage, deletePage } = require('../controllers/pagesController')
const { authenticate } = require('../middleware/auth')

// Public
router.get('/:slug', getPage)

// Admin only
router.get('/', authenticate, getAllPages)
router.post('/', authenticate, upsertPage)
router.delete('/:slug', authenticate, deletePage)

module.exports = router