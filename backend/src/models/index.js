const User = require('./User')
const Ad = require('./Ad')
const Notification = require('./Notification')
const Report = require('./Report')
const ActivityLog = require('./ActivityLog')
const BlacklistedEmail = require('./BlacklistedEmail')
const Page = require('./Page')
const SiteSettings = require('./SiteSettings')

// User — Ad
User.hasMany(Ad, { foreignKey: 'sellerId', as: 'ads' })
Ad.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })

// User — Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Ad — Report
Ad.hasMany(Report, { foreignKey: 'adId', as: 'reports' })
Report.belongsTo(Ad, { foreignKey: 'adId', as: 'ad' })

// User — Report (reported by)
User.hasMany(Report, { foreignKey: 'reportedById', as: 'reportsMade' })
Report.belongsTo(User, { foreignKey: 'reportedById', as: 'reportedBy' })

// User — Report (action by)
User.hasMany(Report, { foreignKey: 'actionById', as: 'reportsActioned' })
Report.belongsTo(User, { foreignKey: 'actionById', as: 'actionBy' })

// User — ActivityLog (performed by)
User.hasMany(ActivityLog, { foreignKey: 'performedById', as: 'activityLogs' })
ActivityLog.belongsTo(User, { foreignKey: 'performedById', as: 'performedBy' })

// User — ActivityLog (target)
User.hasMany(ActivityLog, { foreignKey: 'targetUserId', as: 'targetedLogs' })
ActivityLog.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' })

// User — BlacklistedEmail
User.hasMany(BlacklistedEmail, { foreignKey: 'deletedById', as: 'blacklistedEmails' })
BlacklistedEmail.belongsTo(User, { foreignKey: 'deletedById', as: 'deletedBy' })

module.exports = { User, Ad, Notification, Report, ActivityLog, BlacklistedEmail, Page, SiteSettings }