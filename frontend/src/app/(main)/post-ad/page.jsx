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
import PropertyForSellForm from '../../../components/forms/PropertyForSellForm'
import PropertyForRentForm from '../../../components/forms/PropertyForRentForm'
import { useSiteSettings } from '../../../context/SiteSettingsContext'
import { PAKISTAN_LOCATIONS } from '../../../constants/pakistanLocations'
import { Suspense } from 'react'

// Known category → dedicated form mapping
const FORM_MAP = {
  mobiles:      MobileForm,
  cars:         CarForm,
  motorcycles:  MotorcycleForm,
  electronics:  ElectronicsForm,
  furniture:    FurnitureForm,
  'furniture-home': FurnitureForm,
  fashion:      FashionForm,
  'fashion-beauty': FashionForm,
  others:             OthersForm,
  'property-for-sell': PropertyForSellForm,
  'property-for-rent': PropertyForRentForm,
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
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', marginBottom: '20px',
        }}>📞</div>

        <h2 style={{
          fontSize: '22px', fontWeight: '800', fontFamily: 'Inter, sans-serif',
          color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em',
        }}>Add Phone Number</h2>
        <p style={{
          fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif',
          marginBottom: '24px', lineHeight: '1.6',
        }}>
          Buyers will contact you on this number. A valid phone number is required to post ads.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '13px', fontWeight: '600',
            color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '8px',
          }}>Pakistani Mobile Number</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px', color: '#6B7280',
              fontFamily: 'Inter, sans-serif', fontWeight: '600',
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px',
            border: '1.5px solid #E5E7EB', borderRadius: '10px',
            background: 'white', color: '#374151',
            fontSize: '14px', fontWeight: '600',
            fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }}>Cancel</button>
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

function PostAdPageInner() {
  const { user } = useAuth()
  const { settings } = useSiteSettings()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId   = searchParams.get('edit')
  const isEditMode = !!editId

  const [category,       setCategory]       = useState('')
  const [title,          setTitle]          = useState('')
  const [description,    setDescription]    = useState('')
  const [price,          setPrice]          = useState('')
  const [area,           setArea]           = useState('')
  const [subArea,        setSubArea]        = useState('')
  const [images,         setImages]         = useState([])
  const [previews,       setPreviews]       = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [details,        setDetails]        = useState({})
  const [loading,        setLoading]        = useState(false)
  const [fetching,       setFetching]       = useState(false)
  const [authChecked,    setAuthChecked]    = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  // Build category list from settings (active ones) — fallback to hardcoded
  const categoryList = (() => {
    const cats = settings?.categories?.filter(c => c.isActive)
    if (cats && cats.length > 0) return cats
    // fallback
    return [
      { id: 'mobiles',      name: 'Mobiles',         icon: '📱' },
      { id: 'cars',         name: 'Cars',            icon: '🚗' },
      { id: 'motorcycles',  name: 'Motorcycles',     icon: '🏍️' },
      { id: 'electronics',  name: 'Electronics',     icon: '💻' },
      { id: 'furniture',    name: 'Furniture & Home',icon: '🛋️' },
      { id: 'fashion',      name: 'Fashion & Beauty',icon: '👗' },
      { id: 'others',       name: 'Others',          icon: '📦' },
    ]
  })()

  // Get the right form component — known categories get dedicated form,
  // admin-added categories get OthersForm as fallback
  const CategoryForm = category
    ? (FORM_MAP[category] || OthersForm)
    : null

  useEffect(() => {
    setAuthChecked(true)
    if (!user) { router.push('/login'); return }
    if (user && !user.phone) setShowPhoneModal(true)
  }, [user])

  useEffect(() => {
    if (isEditMode && editId) fetchAdData()
  }, [editId])

  const fetchAdData = async () => {
    setFetching(true)
    try {
      const res = await api.get(`/ads/${editId}`)
      const ad  = res.data.ad
      setCategory(ad.category   || '')
      setTitle(ad.title         || '')
      setDescription(ad.description || '')
      setPrice(String(ad.price  || ''))
      const areaParts = (ad.area || '').split(' - ')
      setArea(areaParts[0] || '')
      setSubArea(areaParts[1] || '')
      setDetails(ad.details     || {})
      setExistingImages(ad.images || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load ad data')
    } finally {
      setFetching(false)
    }
  }

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files)
    const combined = [...images, ...newFiles].slice(0, 5)
    setImages(combined)
    setPreviews(combined.map(f => URL.createObjectURL(f)))
  }

  const handleRemoveImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx)
    const newPreviews = previews.filter((_, i) => i !== idx)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSetMainImage = (idx) => {
    // Move selected image to index 0
    const newImages = [...images]
    const newPreviews = [...previews]
    const [imgItem] = newImages.splice(idx, 1)
    const [prevItem] = newPreviews.splice(idx, 1)
    newImages.unshift(imgItem)
    newPreviews.unshift(prevItem)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSubmit = async () => {
    if (!user?.phone) { setShowPhoneModal(true); return }
    if (!title || !price || !category) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title',       title)
      formData.append('description', description)
      formData.append('price',       price)
      formData.append('category',    category)
      formData.append('area',        subArea ? `${area} - ${subArea}` : area)
      formData.append('details',     JSON.stringify(details))
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

  if (!authChecked || !user) return null
  if (fetching) return (
    <div className="page-container" style={{ padding: '32px 20px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading ad data...</p>
    </div>
  )

  const inp = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border-default)',
    borderRadius: '8px', fontSize: '14px',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  }
  const lbl = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    marginBottom: '6px', fontFamily: 'Inter, sans-serif',
  }
  const cardStyle = {
    background: 'white', borderRadius: '16px', padding: '24px',
    marginBottom: '20px', border: '1px solid var(--border-default)',
  }

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>

      {showPhoneModal && (
        <PhoneModal
          onSave={() => setShowPhoneModal(false)}
          onClose={() => { setShowPhoneModal(false); router.push('/profile') }}
        />
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>
          {isEditMode ? 'Edit Ad' : 'Post an Ad'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginBottom: '32px', fontSize: '14px' }}>
          {isEditMode
            ? 'Update your ad details. It will go for review again after saving.'
            : 'Sell anything in Attock for free'}
        </p>

        {/* 1 — Category */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
            1. Select Category *
          </h2>
          <div className="post-ad-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {categoryList.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  if (isEditMode) return
                  setCategory(cat.id)
                  setDetails({}) // reset details on category change
                }}
                style={{
                  padding: '12px 8px',
                  border: `2px solid ${category === cat.id ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  borderRadius: '10px',
                  background: category === cat.id ? 'var(--brand-light, #F0EBFF)' : 'white',
                  color: category === cat.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '600',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: isEditMode ? 'not-allowed' : 'pointer',
                  textAlign: 'center', transition: 'all 0.15s',
                  opacity: isEditMode && category !== cat.id ? 0.5 : 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '6px',
                }}
              >
                {/* Show uploaded icon or emoji */}
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '20px' }}>{cat.icon || '📦'}</span>
                )}
                {cat.name}
              </button>
            ))}
          </div>
          {isEditMode && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: '10px' }}>
              Category cannot be changed while editing.
            </p>
          )}
        </div>

        {/* 2 — Basic Info */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
            2. Basic Information
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Samsung Galaxy A54 — 8GB/256GB" maxLength={100}
              style={inp}
              onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item..." rows={4}
              style={{ ...inp, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>
          <div className='post-ad-fields-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Price (Rs) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 75000" style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <div>
              <label style={lbl}>City *</label>
              <select value={area} onChange={e => { setArea(e.target.value); setSubArea('') }}
                style={{ ...inp, appearance: 'auto' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              >
                <option value="">Select City</option>
                {PAKISTAN_LOCATIONS.map(p => (
                  <optgroup key={p.province} label={p.province}>
                    {p.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Area/Locality — show after city selected */}
          {area && (
            <div style={{ marginTop: '16px' }}>
              <label style={lbl}>Area / Locality</label>
              <input
                value={subArea}
                onChange={e => setSubArea(e.target.value)}
                placeholder={`e.g. Phase 2, Gulberg, Cantt, ${area}`}
                style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                Enter your neighbourhood, sector, or street for better reach
              </p>
            </div>
          )}
        </div>

        {/* 3 — Category Details */}
        {CategoryForm && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
              3. Category Details
            </h2>
            <CategoryForm data={details} onChange={setDetails} />
          </div>
        )}

        {/* 4 — Photos */}
        <div style={cardStyle}>
          <style>{`
            .img-thumb:hover .img-remove { opacity: 1 !important; }
            .img-thumb:hover .img-main-btn { opacity: 1 !important; }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" }}>
              4. Photos ({previews.length}/5)
            </h2>
            {previews.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                First image = main photo
              </span>
            )}
          </div>

          {/* Existing images in edit mode */}
          {isEditMode && existingImages.length > 0 && previews.length === 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Current Photos:
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-default)' }} />
                ))}
              </div>
            </div>
          )}

          {/* Image previews with remove + main */}
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {previews.map((p, i) => (
                <div key={i} className="img-thumb" style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                  <img src={p} alt="" style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', borderRadius: '10px',
                    border: i === 0 ? '2.5px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                  }} />

                  {/* Main badge */}
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', bottom: '4px', left: '4px',
                      background: 'var(--brand-primary)', color: 'white',
                      fontSize: '9px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                      padding: '2px 5px', borderRadius: '4px',
                    }}>MAIN</div>
                  )}

                  {/* Remove button */}
                  <button
                    className="img-remove"
                    onClick={() => handleRemoveImage(i)}
                    style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#EF4444', color: 'white', border: '2px solid white',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '11px', fontWeight: '800',
                      opacity: 0, transition: 'opacity 0.15s', zIndex: 2,
                      lineHeight: 1, padding: 0,
                    }}
                  >✕</button>

                  {/* Set as main button (not for index 0) */}
                  {i !== 0 && (
                    <button
                      className="img-main-btn"
                      onClick={() => handleSetMainImage(i)}
                      title="Set as main photo"
                      style={{
                        position: 'absolute', bottom: '4px', left: '4px',
                        background: 'rgba(0,0,0,0.65)', color: 'white',
                        fontSize: '9px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                        padding: '2px 5px', borderRadius: '4px',
                        border: 'none', cursor: 'pointer',
                        opacity: 0, transition: 'opacity 0.15s', zIndex: 2,
                        whiteSpace: 'nowrap',
                      }}
                    >Set Main</button>
                  )}
                </div>
              ))}

              {/* Add more button if less than 5 */}
              {previews.length < 5 && (
                <label style={{
                  width: '90px', height: '90px', flexShrink: 0,
                  border: '2px dashed var(--border-default)', borderRadius: '10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                  background: 'var(--bg-secondary)', transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  <span style={{ fontSize: '22px' }}>+</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>Add</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          )}

          {/* Main upload zone — only show if no previews */}
          {previews.length === 0 && (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '32px',
              border: '2px dashed var(--border-default)', borderRadius: '12px',
              cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
              <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-secondary)' }}>
                {isEditMode ? 'Upload new photos (replaces current)' : 'Click to upload photos'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                JPG, PNG up to 5MB each — Max 5 photos
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', fontSize: '16px',
            fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
            background: 'var(--brand-primary)', color: 'white',
            border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
          }}
        >
          {loading
            ? (isEditMode ? 'Updating...' : 'Posting...')
            : (isEditMode ? 'Update Ad' : 'Post Ad')
          }
        </button>
      </div>
    </div>
  )
}

export default function PostAdPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '32px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        Loading...
      </div>
    }>
      <PostAdPageInner />
    </Suspense>
  )
}