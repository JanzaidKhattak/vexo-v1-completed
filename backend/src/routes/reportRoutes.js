const express = require('express')
const router  = express.Router()
const {
  createReport, getReports, getBlockedAds, getBlockedUsers,
  unblockAd, unblockUser, handleReportAction, getReportStats,
} = require('../controllers/reportController')
const { authenticate, isAdmin } = require('../middleware/auth')

// User — submit report
router.post('/:id', authenticate, createReport)

// Admin — specific routes BEFORE /:id
router.get('/stats',               authenticate, isAdmin, getReportStats)
router.get('/blocked-ads',         authenticate, isAdmin, getBlockedAds)
router.get('/blocked-users',       authenticate, isAdmin, getBlockedUsers)
router.get('/',                    authenticate, isAdmin, getReports)
router.patch('/:id/action',        authenticate, isAdmin, handleReportAction)
router.patch('/unblock-ad/:id',    authenticate, isAdmin, unblockAd)
router.patch('/unblock-user/:id',  authenticate, isAdmin, unblockUser)

module.exports = router