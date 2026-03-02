'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../../lib/axios'
import AdCard from '../../../../components/ads/AdCard'
import { CATEGORIES } from '../../../../constants/categories'

export default function CategoryPage() {
  const { slug } = useParams()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')

  const category = CATEGORIES.find(c => c.id === slug)

  useEffect(() => {
    fetchAds()
  }, [slug, page, sortBy])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ads?category=${slug}&page=${page}&sortBy=${sortBy}`)
      setAds(res.data.ads)
      setTotal(res.data.pagination.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
            {category?.name || slug}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            {loading ? 'Loading...' : `${total} ads in Attock`}
          </p>
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
          style={{
            padding: '8px 14px', border: '1.5px solid var(--border-default)',
            borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif',
            outline: 'none', cursor: 'pointer', background: 'white',
          }}>
          <option value="createdAt">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '280px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-default)' }} />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>No ads yet</h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Be the first to post in this category!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {ads.map(ad => (
            <AdCard key={ad._id} ad={ad} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', opacity: page === 1 ? 0.5 : 1 }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
            Page {page}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={ads.length < 20}
            className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', opacity: ads.length < 20 ? 0.5 : 1 }}>
            Next →
          </button>
        </div>
      )}

    </div>
  )
}