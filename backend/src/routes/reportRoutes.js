const express = require('express')
const router = express.Router()
const {
  createReport,
  getReports,
  handleReportAction,
  getReportStats
} = require('../controllers/reportController')
const { authenticate, isAdmin } = require('../middleware/auth')

// User routes
router.post('/:id', authenticate, createReport)

// Admin routes
router.get('/', authenticate, isAdmin, getReports)
router.get('/stats', authenticate, isAdmin, getReportStats)
router.patch('/:id/action', authenticate, isAdmin, handleReportAction)

module.exports = router