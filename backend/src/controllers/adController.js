const { Op } = require('sequelize')
const { Ad, User } = require('../models/index')
const { cloudinary } = require('../config/cloudinary')
const { createNotification } = require('./notificationController')

const getAds = async (req, res) => {
  try {
    const {
      category, search,
      page = 1, limit = 20,
      sortBy = 'createdAt',
      minPrice, maxPrice,
      city, area,
      ...rest
    } = req.query

    const where = { status: 'active', isDeletedByUser: false }

    if (category) where.category = category
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price[Op.gte] = Number(minPrice)
      if (maxPrice) where.price[Op.lte] = Number(maxPrice)
    }
    if (city && area) where.area = { [Op.like]: `%${area}%` }
    else if (city) where.area = { [Op.like]: `%${city}%` }
    else if (area) where.area = { [Op.like]: `%${area}%` }

    // Details filters
    const KNOWN = new Set(['category','search','page','limit','sortBy','minPrice','maxPrice','city','area'])
    Object.entries(rest).forEach(([key, value]) => {
      if (!KNOWN.has(key) && value) {
        where[`details`] = { [Op.like]: `%"${key}":"${value}"%` }
      }
    })

    const order =
      sortBy === 'price_asc'  ? [['price', 'ASC']] :
      sortBy === 'price_desc' ? [['price', 'DESC']] :
      sortBy === 'oldest'     ? [['createdAt', 'ASC']] :
      sortBy === 'views'      ? [['views', 'DESC']] :
                                [['createdAt', 'DESC']]

    const { count, rows: ads } = await Ad.findAndCountAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'location'] }],
      order,
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })

    // Format ads for frontend compatibility
    const formattedAds = ads.map(ad => formatAd(ad))

    return res.status(200).json({
      success: true, ads: formattedAds,
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) },
    })
  } catch (error) {
    console.error('getAds error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'location', 'createdAt', 'isEmailVerified'] }],
    })
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    await ad.increment('views')

    const sellerAdCount = await Ad.count({
      where: { sellerId: ad.sellerId, status: 'active', isDeletedByUser: false },
    })

    return res.status(200).json({ success: true, ad: formatAd(ad), sellerAdCount })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getRelatedAds = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    const related = await Ad.findAll({
      where: { id: { [Op.ne]: req.params.id }, category: ad.category, status: 'active', isDeletedByUser: false },
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: 8,
    })

    return res.status(200).json({ success: true, ads: related.map(formatAd) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const createAd = async (req, res) => {
  try {
    const { title, description, price, category, area, details } = req.body
    const images = req.files ? req.files.map(f => f.path) : []

    const ad = await Ad.create({
      title,
      description: description || ' ',
      price: Number(price),
      category,
      area: area || '',
      details: details ? JSON.parse(details) : {},
      images,
      sellerId: req.user.id,
      location: 'Pakistan',
    })

    await User.increment('totalAds', { where: { id: req.user.id } })

    try {
      const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
      for (const admin of admins) {
        await createNotification(admin.id, '📋 New Ad Submitted',
          `"${ad.title}" submitted for review by ${req.user.firstName || req.user.email}`,
          'ad_status', `/vexo-admin/ads?highlight=${ad.id}`)
      }
    } catch (e) { console.error('Notif error:', e) }

    return res.status(201).json({ success: true, ad: formatAd(ad) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const { title, description, price, area, details } = req.body
    const newImages = req.files ? req.files.map(f => f.path) : []

    const history = ad.updateHistory || []
    const changes = {}
    if (title && title !== ad.title) changes.title = { old: ad.title, new: title }
    if (description && description !== ad.description) changes.description = { old: ad.description, new: description }
    if (price && Number(price) !== Number(ad.price)) changes.price = { old: ad.price, new: Number(price) }
    if (area && area !== ad.area) changes.area = { old: ad.area, new: area }
    history.push({ updatedAt: new Date(), changes })

    await ad.update({
      title: title || ad.title,
      description: description || ad.description,
      price: price ? Number(price) : ad.price,
      area: area || ad.area,
      details: details ? JSON.parse(details) : ad.details,
      images: newImages.length > 0 ? newImages : ad.images,
      status: 'pending',
      hasUpdate: true,
      updateHistory: history,
    })

    const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
    for (const adm of admins) {
      await createNotification(adm.id, '✏️ Ad Updated',
        `"${ad.title}" was edited — needs re-review`,
        'ad_status', `/vexo-admin/ads?highlight=${ad.id}`)
    }

    return res.status(200).json({ success: true, ad: formatAd(ad) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const adTitle = ad.title
    for (const imageUrl of ad.images) {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await ad.destroy()
    await User.decrement('totalAds', { where: { id: ad.sellerId } })

    if (!['admin', 'super-admin'].includes(req.user.role)) {
      const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
      for (const adm of admins) {
        await createNotification(adm.id, '🗑️ Ad Deleted',
          `"${adTitle}" deleted by ${req.user.firstName || req.user.email}`,
          'general', '/vexo-admin/ads')
      }
    }

    return res.status(200).json({ success: true, message: 'Ad deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getTrendingAds = async (req, res) => {
  try {
    const { city } = req.query
    const where = { status: 'active', isDeletedByUser: false }
    if (city) where.area = { [Op.like]: `%${city}%` }

    const ads = await Ad.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar'] }],
      order: [['views', 'DESC']],
      limit: 10,
    })

    return res.status(200).json({ success: true, ads: ads.map(formatAd) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getRecentAds = async (req, res) => {
  try {
    const { limit = 20, city } = req.query
    const where = { status: 'active', isDeletedByUser: false }
    if (city) where.area = { [Op.like]: `%${city}%` }

    const ads = await Ad.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
    })

    return res.status(200).json({ success: true, ads: ads.map(formatAd) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAsSold = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await ad.update({ status: 'sold', soldAt: new Date() })

    const admins = await User.findAll({ where: { role: ['admin', 'super-admin'] } })
    for (const adm of admins) {
      await createNotification(adm.id, '🏷️ Ad Sold',
        `"${ad.title}" marked as sold by ${req.user.firstName || req.user.email}`,
        'ad_status', `/vexo-admin/ads?highlight=${ad.id}`)
    }

    return res.status(200).json({ success: true, message: 'Ad marked as sold' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Helper — MongoDB jaisa format return karo frontend ke liye
const formatAd = (ad) => {
  const plain = ad.toJSON ? ad.toJSON() : ad
  return {
    ...plain,
    _id: plain.id,
    seller: plain.seller ? {
      ...plain.seller,
      _id: plain.seller.id,
      name: `${plain.seller.firstName || ''} ${plain.seller.lastName || ''}`.trim(),
    } : null,
  }
}

const getFeaturedAds = async (req, res) => {
  try {
    const now = new Date()
    const ads = await Ad.findAll({
      where: {
        isFeatured: true,
        status: 'active',
        isDeletedByUser: false,
        featuredUntil: { [Op.gt]: now },
      },
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    })
    return res.status(200).json({ success: true, ads: ads.map(formatAd) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  getAds, getAdById, createAd, updateAd, deleteAd,
  getTrendingAds, getRecentAds, markAsSold, getRelatedAds,
  getFeaturedAds,
}