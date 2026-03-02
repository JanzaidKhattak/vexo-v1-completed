'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function PostAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    setAuthChecked(true)
    if (!user) router.push('/login')
  }, [user])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
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

      await api.post('/ads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(' Ad posted successfully! It will be active within 24 hours after review.', { duration: 5000 })
      router.push('/profile')
    } catch (err) {
      console.error(err)
      toast.error('Failed to post ad')
    } finally {
      setLoading(false)
    }
  }

  const CategoryForm = category ? FORM_MAP[category] : null

  if (!authChecked || !user) return null

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
          Post an Ad
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '32px' }}>
          Sell anything in Attock for free
        </p>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            1. Select Category *
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '12px 8px',
                  border: `2px solid ${category === cat.id ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  borderRadius: '10px',
                  background: category === cat.id ? 'var(--brand-light)' : 'white',
                  color: category === cat.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

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

        {CategoryForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>3. Category Details</h2>
            <CategoryForm data={details} onChange={setDetails} />
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>4. Photos (Max 5)</h2>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', border: '2px dashed var(--border-default)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
            <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>Click to upload photos</span>
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

        <button onClick={handleSubmit} disabled={loading} className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Posting...' : '🚀 Post Ad'}
        </button>

      </div>
    </div>
  )
}