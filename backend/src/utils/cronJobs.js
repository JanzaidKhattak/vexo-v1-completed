const cron = require('node-cron')
const { Ad } = require('../models/index')
const { Op } = require('sequelize')
const { createNotification } = require('../controllers/notificationController')

const startCronJobs = () => {

  // Har raat 12 baje expired featured ads expire karo
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running featured ads expiry check...')
      const now = new Date()

      const expiredAds = await Ad.findAll({
        where: {
          isFeatured: true,
          featuredUntil: { [Op.lt]: now },
        },
      })

      for (const ad of expiredAds) {
        await ad.update({
          isFeatured: false,
          featuredUntil: null,
          featuredDays: 0,
        })

        await createNotification(
          ad.sellerId,
          '⏰ Featured Expired',
          `Your ad "${ad.title}" featured period has ended. Contact us to renew!`,
          'ad_status',
          `/ads/${ad.id}`
        )
      }

      console.log(`Featured expiry: ${expiredAds.length} ads expired.`)
    } catch (error) {
      console.error('Cron job error:', error)
    }
  })

  console.log('Cron jobs started!')
}

module.exports = { startCronJobs }