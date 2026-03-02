const express = require('express')
const router = express.Router()
const {
  getDashboard,
  getAllAds,
  updateAdStatus,
  getAllUsers,
  updateUserStatus,
  getAllReports,
  updateReportStatus
} = require('../controllers/adminController')
const { authenticate, isAdmin } = require('../middleware/auth')

router.use(authenticate, isAdmin)

router.get('/dashboard', getDashboard)
router.get('/ads', getAllAds)
router.patch('/ads/:id/status', updateAdStatus)
router.get('/users', getAllUsers)
router.patch('/users/:id/status', updateUserStatus)
router.get('/reports', getAllReports)
router.patch('/reports/:id/status', updateReportStatus)

module.exports = router