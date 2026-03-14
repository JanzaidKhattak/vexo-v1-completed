const Ad = require('../models/Ad')
const User = require('../models/User')
const { cloudinary } = require('../config/cloudinary')
const { createNotification } = require('./notificationController')

const getAds = async (req, res) => {
  try {
    const {
      category, search,
      page = 1, limit = 20,
      sortBy = 'createdAt',
      sort,
      minPrice, maxPrice,
      ...rest
    } = req.query

    const query = { status: 'active', isDeletedByUser: false }

    // Category
    if (category) query.category = category

    // Text search
    if (search) query.$text = { $search: search }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // City filter — filters by ad.area field (case-insensitive)
    if (rest.city) {
      query.area = { $regex: new RegExp(rest.city, 'i') }
    }

    // Details filters (brand, make, condition, type, gender, etc.)
    // Any query param that isn't a known system param → treat as details.key
    const KNOWN = new Set(['category','search','page','limit','sortBy','sort','minPrice','maxPrice','city'])
    Object.entries(rest).forEach(([key, value]) => {
      if (!KNOWN.has(key) && value) {
        query[`details.${key}`] = { $regex: new RegExp(`^${value}$`, 'i') }
      }
    })

    // Sort — support both sortBy (new frontend) and sort (legacy)
    const s = sortBy || sort
    const sortOption =
      s === 'price_asc'  || s === 'price_low'  ? { price:      1 } :
      s === 'price_desc' || s === 'price_high' ? { price:     -1 } :
      s === 'oldest'                            ? { createdAt:  1 } :
      s === 'views'                             ? { views:     -1 } :
                                                  { createdAt: -1 }

    const total = await Ad.countDocuments(query)
    const ads   = await Ad.find(query)
      .populate('seller', 'name firstName lastName phone avatar location')
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      ads,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('getAds error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('seller', 'name firstName lastName phone avatar location createdAt isEmailVerified')

    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    await Ad.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    const sellerAdCount = await Ad.countDocuments({
      seller: ad.seller._id,
      status: 'active',
      isDeletedByUser: false,
    })

    return res.status(200).json({ success: true, ad, sellerAdCount })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getRelatedAds = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })

    const related = await Ad.find({
      _id: { $ne: req.params.id },
      category: ad.category,
      status: 'active',
      isDeletedByUser: false,
    })
      .populate('seller', 'name firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(8)

    return res.status(200).json({ success: true, ads: related })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const createAd = async (req, res) => {
  try {
    const { title, description, price, category, area, details } = req.body
    const images = req.files ? req.files.map(f => f.path) : []

    const ad = await Ad.create({
      title, description,
      price: Number(price),
      category,
      area: area || '',
      details: details ? JSON.parse(details) : {},
      images,
      seller: req.user._id,
      location: 'Pakistan',
    })

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalAds: 1 } })
    return res.status(201).json({ success: true, ad })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const { title, description, price, area, details } = req.body
    const newImages = req.files ? req.files.map(f => f.path) : []

    const changes = {}
    if (title       && title       !== ad.title)       changes.title       = { old: ad.title,       new: title }
    if (description && description !== ad.description) changes.description = { old: ad.description, new: description }
    if (price       && Number(price) !== ad.price)     changes.price       = { old: ad.price,       new: Number(price) }
    if (area        && area        !== ad.area)        changes.area        = { old: ad.area,        new: area }

    ad.title       = title       || ad.title
    ad.description = description || ad.description
    ad.price       = price       ? Number(price) : ad.price
    ad.area        = area        || ad.area
    ad.details     = details     ? JSON.parse(details) : ad.details
    if (newImages.length > 0) ad.images = newImages
    ad.status    = 'pending'
    ad.hasUpdate = true
    ad.updateHistory.push({ updatedAt: new Date(), changes })

    await ad.save()

    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await createNotification(
        admin._id, 'Ad Updated by User',
        `User has updated the ad "${ad.title}". Review is pending.`,
        'general', `/admin/ads`
      )
    }

    return res.status(200).json({ success: true, ad })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const adTitle = ad.title
    for (const imageUrl of ad.images) {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await Ad.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(ad.seller, { $inc: { totalAds: -1 } })

    if (req.user.role !== 'admin') {
      const admins = await User.find({ role: 'admin' })
      for (const admin of admins) {
        await createNotification(
          admin._id, 'Ad Deleted by User',
          `User has deleted their ad "${adTitle}".`,
          'general', `/admin/ads`
        )
      }
    }

    return res.status(200).json({ success: true, message: 'Ad deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getTrendingAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'active', isDeletedByUser: false })
      .populate('seller', 'name phone avatar')
      .sort({ views: -1 })
      .limit(10)
    return res.status(200).json({ success: true, ads })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getRecentAds = async (req, res) => {
  try {
    const { limit = 20 } = req.query
    const ads = await Ad.find({ status: 'active', isDeletedByUser: false })
      .populate('seller', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
    return res.status(200).json({ success: true, ads })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAsSold = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' })
    if (ad.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    ad.status = 'sold'
    ad.soldAt = new Date()
    await ad.save()

    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await createNotification(
        admin._id, 'Ad Marked as Sold',
        `User has marked the ad "${ad.title}" as sold.`,
        'general', `/admin/ads`
      )
    }

    return res.status(200).json({ success: true, message: 'Ad marked as sold' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  getAds, getAdById, createAd, updateAd, deleteAd,
  getTrendingAds, getRecentAds, markAsSold, getRelatedAds,
}