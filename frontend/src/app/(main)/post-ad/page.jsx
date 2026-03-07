'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'
import MobileForm from '../../../components/forms/MobileForm'
import CarForm from '../../../components/forms/CarForm'
import MotorcycleForm from '../../../components/forms/MotorcycleForm'
import ElectronicsForm from '../../../components/forms/ElectronicsForm'
import FurnitureForm from '../../../components/forms/FurnitureForm'
import FashionForm from '../../../components/forms/FashionForm'
import OthersForm from '../../../components/forms/OthersForm'
import { CATEGORIES } from '../../../constants/categories'

const FORM_MAP = {
  mobiles: MobileForm,
  cars: CarForm,
  motorcycles: MotorcycleForm,
  electronics: ElectronicsForm,
  furniture: FurnitureForm,
  fashion: FashionForm,
  others: OthersForm,
}

// Phone Number Modal
function PhoneModal({ onSave, onClose }) {
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const { updateUser } = useAuth()

  const handleSave = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('phone', phone)
      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(res.data.user)
      toast.success('Phone number saved!')
      onSave(phone)
    } catch {
      toast.error('Failed to save phone number')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '36px 32px', width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        animation: 'modalIn 0.3s ease',
      }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', marginBottom: '20px',
        }}>📞</div>

        <h2 style={{
          fontSize: '22px', fontWeight: '800', fontFamily: 'Inter, sans-serif',
          color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em',
        }}>
          Add Phone Number
        </h2>
        <p style={{
          fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif',
          marginBottom: '24px', lineHeight: '1.6',
        }}>
          Buyers will contact you on this number. A valid phone number is required to post ads.
        </p>

        {/* Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '13px', fontWeight: '600',
            color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '8px',
          }}>
            Pakistani Mobile Number
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
            }}>+92</span>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="03001234567"
              style={{
                width: '100%', padding: '12px 14px 12px 48px',
                border: '1.5px solid #E5E7EB', borderRadius: '10px',
                fontSize: '15px', fontFamily: 'Inter, sans-serif',
                outline: 'none', boxSizing: 'border-box',
                letterSpacing: '1px', fontWeight: '600',
              }}
              onFocus={e => e.target.style.borderColor = '#6C3AF5'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
            This will be saved to your profile and visible to buyers
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px',
            border: '1.5px solid #E5E7EB', borderRadius: '10px',
            background: 'white', color: '#374151',
            fontSize: '14px', fontWeight: '600',
            fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: '12px',
            background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
            border: 'none', borderRadius: '10px',
            color: 'white', fontSize: '14px', fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save & Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId

  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  useEffect(() => {
    setAuthChecked(true)
    if (!user) { router.push('/login'); return }
    // Phone number check
    if (user && !user.phone) {
      setShowPhoneModal(true)
    }
  }, [user])

  useEffect(() => {
    if (isEditMode && editId) fetchAdData()
  }, [editId])

  const fetchAdData = async () => {
    setFetching(true)
    try {
      const res = await api.get(`/ads/${editId}`)
      const ad = res.data.ad
      setCategory(ad.category || '')
      setTitle(ad.title || '')
      setDescription(ad.description || '')
      setPrice(String(ad.price || ''))
      setArea(ad.area || '')
      setDetails(ad.details || {})
      setExistingImages(ad.images || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load ad data')
    } finally {
      setFetching(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    // Double check phone
    if (!user?.phone) {
      setShowPhoneModal(true)
      return
    }
    if (!title || !price || !category) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('area', area)
      formData.append('details', JSON.stringify(details))
      images.forEach(img => formData.append('images', img))

      if (isEditMode) {
        await api.put(`/ads/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Ad updated! It will be reviewed again before going live.', { duration: 5000 })
      } else {
        await api.post('/ads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Ad posted! It will be active within 24 hours after review.', { duration: 5000 })
      }
      router.push('/profile')
    } catch (err) {
      console.error(err)
      toast.error(isEditMode ? 'Failed to update ad' : 'Failed to post ad')
    } finally {
      setLoading(false)
    }
  }

  const CategoryForm = category ? FORM_MAP[category] : null

  if (!authChecked || !user) return null
  if (fetching) return (
    <div className="page-container" style={{ padding: '32px 20px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading ad data...</p>
    </div>
  )

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>

      {/* Phone Modal */}
      {showPhoneModal && (
        <PhoneModal
          onSave={(phone) => setShowPhoneModal(false)}
          onClose={() => { setShowPhoneModal(false); router.push('/profile') }}
        />
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
          {isEditMode ? '✏️ Edit Ad' : 'Post an Ad'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '32px' }}>
          {isEditMode ? 'Update your ad details. It will go for review again after saving.' : 'Sell anything in Attock for free'}
        </p>

        {/* Category */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            1. Select Category *
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => !isEditMode && setCategory(cat.id)} style={{
                padding: '12px 8px',
                border: `2px solid ${category === cat.id ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                borderRadius: '10px',
                background: category === cat.id ? 'var(--brand-light)' : 'white',
                color: category === cat.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
                cursor: isEditMode ? 'not-allowed' : 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
                opacity: isEditMode && category !== cat.id ? 0.5 : 1,
              }}>
                {cat.name}
              </button>
            ))}
          </div>
          {isEditMode && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: '10px' }}>
              ⚠️ Category cannot be changed while editing.
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            2. Basic Information
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Samsung Galaxy A54 — 8GB/256GB" maxLength={100}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item..." rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Price (Rs) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 75000"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Area</label>
              <input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Attock City"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Category Details */}
        {CategoryForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>3. Category Details</h2>
            <CategoryForm data={details} onChange={setDetails} />
          </div>
        )}

        {/* Photos */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            4. Photos (Max 5)
          </h2>
          {isEditMode && existingImages.length > 0 && previews.length === 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '8px', color: 'var(--text-secondary)' }}>Current Photos:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }} />
                ))}
              </div>
            </div>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', border: '2px dashed var(--border-default)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
            <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>
              {isEditMode ? 'Upload new photos (replaces current)' : 'Click to upload photos'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>JPG, PNG up to 5MB each</span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              {previews.map((p, i) => (
                <img key={i} src={p} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading
            ? (isEditMode ? '⏳ Updating...' : '⏳ Posting...')
            : (isEditMode ? '💾 Update Ad' : '🚀 Post Ad')
          }
        </button>
      </div>
    </div>
  )
}