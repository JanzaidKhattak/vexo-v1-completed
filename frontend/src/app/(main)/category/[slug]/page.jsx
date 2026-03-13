'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../../lib/axios'
import AdCard from '../../../../components/ads/AdCard'
import { useSiteSettings } from '../../../../context/SiteSettingsContext'

const CATEGORY_FILTERS = {
  mobiles: [
    { key: 'brand',     label: 'Brand',     options: ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Nokia', 'Other'] },
    { key: 'condition', label: 'Condition', options: ['New', 'Like New', 'Good', 'Fair'] },
  ],
  cars: [
    { key: 'make',         label: 'Make',         options: ['Suzuki', 'Toyota', 'Honda', 'Kia', 'Hyundai', 'Daihatsu', 'Other'] },
    { key: 'transmission', label: 'Transmission', options: ['Manual', 'Automatic'] },
    { key: 'condition',    label: 'Condition',    options: ['Excellent', 'Good', 'Fair'] },
  ],
  motorcycles: [
    { key: 'brand',     label: 'Brand',     options: ['Honda', 'Yamaha', 'Suzuki', 'United', 'Road Prince', 'Ravi', 'Super Power', 'Other'] },
    { key: 'condition', label: 'Condition', options: ['New', 'Like New', 'Good', 'Fair'] },
  ],
  electronics: [
    { key: 'type',      label: 'Type',      options: ['TV', 'AC', 'Fridge', 'Washing Machine', 'Laptop', 'Camera', 'Other'] },
    { key: 'condition', label: 'Condition', options: ['New', 'Like New', 'Good', 'Fair'] },
  ],
  'furniture-home': [
    { key: 'type',      label: 'Type',      options: ['Sofa', 'Bed', 'Wardrobe', 'Dining Table', 'Chair', 'Other'] },
    { key: 'condition', label: 'Condition', options: ['New', 'Like New', 'Good', 'Fair'] },
  ],
  furniture: [
    { key: 'type',      label: 'Type',      options: ['Sofa', 'Bed', 'Wardrobe', 'Dining Table', 'Chair', 'Other'] },
    { key: 'condition', label: 'Condition', options: ['New', 'Like New', 'Good', 'Fair'] },
  ],
  'fashion-beauty': [
    { key: 'gender',    label: 'For',       options: ['Men', 'Women', 'Kids', 'Unisex'] },
    { key: 'condition', label: 'Condition', options: ['New with Tags', 'New', 'Like New', 'Good'] },
  ],
  fashion: [
    { key: 'gender',    label: 'For',       options: ['Men', 'Women', 'Kids', 'Unisex'] },
    { key: 'condition', label: 'Condition', options: ['New with Tags', 'New', 'Like New', 'Good'] },
  ],
  'property-for-sell': [
    { key: 'type',      label: 'Property Type', options: ['Land & Plot', 'House', 'Apartment & Flat', 'Shop', 'Office', 'Commercial Space', 'Farm House'] },
    { key: 'bedrooms',  label: 'Bedrooms',      options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
    { key: 'furnishing',label: 'Furnishing',    options: ['Furnished', 'Semi-Furnished', 'Unfurnished'] },
    { key: 'condition', label: 'Condition',     options: ['New / Under Construction', 'Ready to Move', 'Old'] },
  ],
  'property-for-rent': [
    { key: 'type',      label: 'Property Type', options: ['House', 'Apartment & Flat', 'Room', 'Shop', 'Office', 'Commercial Space', 'Warehouse'] },
    { key: 'bedrooms',  label: 'Bedrooms',      options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
    { key: 'furnishing',label: 'Furnishing',    options: ['Furnished', 'Semi-Furnished', 'Unfurnished'] },
    { key: 'rentPer',   label: 'Rent Per',      options: ['Monthly', 'Yearly'] },
  ],
  others: [],
}

const LIMIT = 10

export default function CategoryPage() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()

  const [ads,         setAds]         = useState([])
  const [loading,     setLoading]     = useState(true)
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [sortBy,      setSortBy]      = useState('createdAt')
  const [filters,     setFilters]     = useState({})
  const [minPrice,    setMinPrice]    = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const categoryName = (() => {
    const cat = settings?.categories?.find(c => c.id === slug || c.slug === slug)
    if (cat) return cat.name
    return slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  })()

  const categoryFilters = CATEGORY_FILTERS[slug] || []
  const totalPages = Math.ceil(total / LIMIT)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ category: slug, page, limit: LIMIT, sortBy })
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
      const res = await api.get(`/ads?${params}`)
      setAds(res.data.ads)
      setTotal(res.data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [slug, page, sortBy, filters, minPrice, maxPrice])

  useEffect(() => { fetchAds() }, [fetchAds])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value === prev[key] ? '' : value }))
    setPage(1)
  }

  const clearFilters = () => { setFilters({}); setMinPrice(''); setMaxPrice(''); setPage(1) }

  const hasActiveFilters = Object.values(filters).some(Boolean) || minPrice || maxPrice
  const activeCount = Object.values(filters).filter(Boolean).length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {categoryName}
        </h1>
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
          {loading ? 'Loading...' : `${total} ads in Attock`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? '240px' : '0px', minWidth: sidebarOpen ? '240px' : '0px', overflow: 'hidden', transition: 'all 0.3s ease', flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', position: 'sticky', top: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", color: '#0f172a' }}>Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Clear All
                </button>
              )}
            </div>

            {/* Price */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px' }}>Price Range (Rs)</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[['Min', minPrice, setMinPrice], ['Max', maxPrice, setMaxPrice]].map(([label, val, setter]) => (
                  <input key={label} type="number" placeholder={label} value={val}
                    onChange={e => setter(e.target.value)}
                    onBlur={() => setPage(1)}
                    style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic filters */}
            {categoryFilters.map(f => (
              <div key={f.key} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px' }}>{f.label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {f.options.map(opt => (
                    <button key={opt} onClick={() => handleFilterChange(f.key, opt)} style={{
                      padding: '7px 12px', borderRadius: '8px', textAlign: 'left',
                      fontSize: '13px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                      fontWeight: filters[f.key] === opt ? '600' : '400',
                      background: filters[f.key] === opt ? 'var(--brand-primary)' : '#F8FAFC',
                      color: filters[f.key] === opt ? 'white' : '#374151',
                      border: filters[f.key] === opt ? 'none' : '1px solid #E2E8F0',
                      transition: 'all 0.15s',
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}

            {categoryFilters.length === 0 && (
              <p style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: '8px 0' }}>
                Use price range to filter
              </p>
            )}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
              background: 'white', border: '1.5px solid #E2E8F0', color: '#374151', transition: 'all 0.15s',
            }}>
              {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasActiveFilters && (
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--brand-primary)', background: '#EDE9FE', padding: '4px 10px', borderRadius: '20px', fontFamily: "'DM Sans', sans-serif" }}>
                  {activeCount} active
                </span>
              )}
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }} style={{
                padding: '8px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px',
                fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer',
                background: 'white', color: '#374151',
              }}>
                <option value="createdAt">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[...Array(LIMIT)].map((_, i) => (
                <div key={i} style={{ height: '300px', borderRadius: '12px', background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px', color: '#0f172a' }}>No ads found</h2>
              <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', marginBottom: '16px' }}>Try adjusting your filters</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ padding: '10px 20px', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: '14px' }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {ads.map(ad => <AdCard key={ad._id} ad={ad} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'white', border: '1.5px solid #E2E8F0', color: '#374151', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', background: page === p ? 'var(--brand-primary)' : 'white', color: page === p ? 'white' : '#374151', border: page === p ? 'none' : '1.5px solid #E2E8F0' }}>{p}</button>
                }
                if (p === page - 2 || p === page + 2) return <span key={p} style={{ color: '#94A3B8' }}>...</span>
                return null
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'white', border: '1.5px solid #E2E8F0', color: '#374151', opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}