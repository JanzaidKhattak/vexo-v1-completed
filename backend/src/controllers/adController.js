const Ad = require('../models/Ad')
const User = require('../models/User')
const { cloudinary } = require('../config/cloudinary')

const getAds = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = 'newest' } = req.query
    const query = { status: 'active' }

    if (category) query.category = category
    if (search) query.$text = { $search: search }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } :
      sort === 'price_low' ? { price: 1 } :
      sort === 'price_high' ? { price: -1 } :
      { createdAt: -1 }

    const total = await Ad.countDocuments(query)
    const ads = await Ad.find(query)
      .populate('seller', 'name phone avatar location')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      ads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('seller', 'name phone avatar location createdAt')

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    await Ad.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    return res.status(200).json({ success: true, ad })
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
      description,
      price: Number(price),
      category,
      area: area || '',
      details: details ? JSON.parse(details) : {},
      images,
      seller: req.user._id,
      location: 'Attock'
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

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    if (ad.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const { title, description, price, area, details } = req.body
    const newImages = req.files ? req.files.map(f => f.path) : []

    ad.title = title || ad.title
    ad.description = description || ad.description
    ad.price = price ? Number(price) : ad.price
    ad.area = area || ad.area
    ad.details = details ? JSON.parse(details) : ad.details
    if (newImages.length > 0) ad.images = newImages
    ad.status = 'pending'

    await ad.save()

    return res.status(200).json({ success: true, ad })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    if (ad.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    // Cloudinary se images delete karo
    for (const imageUrl of ad.images) {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await Ad.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(ad.seller, { $inc: { totalAds: -1 } })

    return res.status(200).json({ success: true, message: 'Ad deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getTrendingAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'active' })
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
    const ads = await Ad.find({ status: 'active' })
      .populate('seller', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(20)

    return res.status(200).json({ success: true, ads })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const markAsSold = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' })
    }

    if (ad.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    ad.status = 'sold'
    await ad.save()

    return res.status(200).json({ success: true, message: 'Ad marked as sold' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = { getAds, getAdById, createAd, updateAd, deleteAd, getTrendingAds, getRecentAds, markAsSold }