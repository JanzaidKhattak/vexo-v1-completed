const { User, Ad } = require('../models/index')
const { cloudinary } = require('../config/cloudinary')

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    return res.status(200).json({ success: true, user: formatUser(user) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' })
    }

    const updateData = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    if (req.file) {
      const currentUser = await User.findByPk(req.user.id)
      if (currentUser.avatar) {
        const publicId = currentUser.avatar.split('/').slice(-2).join('/').split('.')[0]
        await cloudinary.uploader.destroy(publicId).catch(() => {})
      }
      updateData.avatar = req.file.path
    }

    await User.update(updateData, { where: { id: req.user.id } })
    const user = await User.findByPk(req.user.id)

    return res.status(200).json({ success: true, user: formatUser(user) })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getUserAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const where = { sellerId: req.user.id }
    if (status) where.status = status

    const { count, rows: ads } = await Ad.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })

    const formattedAds = ads.map(ad => {
      const plain = ad.toJSON()
      return { ...plain, _id: plain.id }
    })

    return res.status(200).json({
      success: true, ads: formattedAds,
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'avatar', 'location', 'totalAds', 'createdAt', 'isEmailVerified']
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const ads = await Ad.findAll({
      where: { sellerId: req.params.id, status: 'active' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    })

    const formattedAds = ads.map(ad => {
      const plain = ad.toJSON()
      return { ...plain, _id: plain.id }
    })

    return res.status(200).json({ success: true, user: formatUser(user), ads: formattedAds })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const formatUser = (user) => {
  const plain = user.toJSON ? user.toJSON() : user
  return {
    ...plain,
    _id: plain.id,
    name: `${plain.firstName || ''} ${plain.lastName || ''}`.trim() || 'User',
  }
}

module.exports = { getProfile, updateProfile, getUserAds, getPublicProfile }