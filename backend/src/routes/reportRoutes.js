const express = require('express')
const router = express.Router()
const { createReport } = require('../controllers/reportController')
const { authenticate } = require('../middleware/auth')

router.post('/:id', authenticate, createReport)

module.exports = router