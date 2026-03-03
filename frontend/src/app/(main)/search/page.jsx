'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '../../../lib/axios'
import AdCard from '../../../components/ads/AdCard'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (query) fetchResults()
    else setLoading(false)
  }, [query])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ads?search=${encodeURIComponent(query)}`)
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
          Search Results
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          {loading ? 'Searching...' : `${total} results for "${query}"`}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '280px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-default)' }} />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>No results found</h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Try different keywords</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {ads.map(ad => (
            <AdCard key={ad._id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}