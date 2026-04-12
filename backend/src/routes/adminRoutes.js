const express = require('express')
const router = express.Router()
const {
  getDashboard,
  getAllAds,
  updateAdStatus,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  updateUserRole,
  getAllReports,
  updateReportStatus,
  getAdmins,
  addAdmin,
  deleteAdmin,
  resetAdminPassword,
  getActivityLogs,
  toggleFeatured,
} = require('../controllers/adminController')
const { authenticate, isAdmin, isSuperAdmin } = require('../middleware/auth')

router.use(authenticate, isAdmin)

// Dashboard
router.get('/dashboard', getDashboard)

// Ads
router.get('/ads', getAllAds)
router.patch('/ads/:id/status', updateAdStatus)
router.patch('/ads/:id/featured', toggleFeatured)

// Users
router.get('/users', getAllUsers)
router.patch('/users/:id/status', updateUserStatus)
router.delete('/users/:id', deleteUser)
router.patch('/users/:id/role', updateUserRole)

// Reports
router.get('/reports', getAllReports)
router.patch('/reports/:id/status', updateReportStatus)

// Admin Management — sirf super-admin
router.get('/admins', isSuperAdmin, getAdmins)
router.post('/admins', isSuperAdmin, addAdmin)
router.delete('/admins/:id', isSuperAdmin, deleteAdmin)
router.patch('/admins/:id/reset-password', isSuperAdmin, resetAdminPassword)

// Activity Logs — sirf super-admin
router.get('/activity-logs', isSuperAdmin, getActivityLogs)

module.exports = router