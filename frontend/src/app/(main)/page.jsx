'use client'

import { useState, useEffect } from 'react'
import HeroBanner from '../../components/home/HeroBanner'
import CategoryGrid from '../../components/home/CategoryGrid'
import TrendingSearches from '../../components/home/TrendingSearches'
import TrendingAds from '../../components/home/TrendingAds'
import RecentAds from '../../components/home/RecentAds'
import AdBannerSlot from '../../components/home/AdBannerSlot'
import api from '../../lib/axios'
import Link from 'next/link'

function SectionHeader({ title, subtitle, href }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: '20px',
    }}>
      <div>
        <h2 style={{
          fontSize: '20px', fontWeight: '800', color: '#0f172a',
          fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em',
          marginBottom: '3px',
        }}>{title}</h2>
        <p style={{
          fontSize: '13px', color: '#94A3B8',
          fontFamily: 'Inter, sans-serif',
        }}>{subtitle}</p>
      </div>
      {href && (
        <Link href={href} style={{
          fontSize: '13px', fontWeight: '600',
          color: 'var(--brand-primary)', textDecoration: 'none',
          padding: '6px 14px', border: '1.5px solid var(--brand-primary)',
          borderRadius: '8px', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-primary)' }}
        >
          View All
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const [trendingAds, setTrendingAds] = useState([])
  const [recentAds, setRecentAds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const [trendingRes, recentRes] = await Promise.all([
        api.get('/ads/trending'),
        api.get('/ads/recent?limit=50'),
      ])
      setTrendingAds(trendingRes.data.ads)
      setRecentAds(recentRes.data.ads)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getAdsByCategory = (category) => recentAds.filter(ad => ad.category === category)

  const sections = [
    { category: 'mobiles', title: 'Latest Mobiles', subtitle: 'Fresh mobile listings in Attock', href: '/category/mobiles' },
    { category: 'cars', title: 'Cars for Sale', subtitle: 'Find your next car in Attock', href: '/category/cars' },
    { category: 'motorcycles', title: 'Motorcycles', subtitle: 'Bikes available in Attock', href: '/category/motorcycles' },
    { category: 'electronics', title: 'Electronics', subtitle: 'TVs, ACs & more', href: '/category/electronics' },
    { category: 'furniture-home', title: 'Furniture & Home', subtitle: 'Home essentials', href: '/category/furniture-home' },
    { category: 'fashion-beauty', title: 'Fashion & Beauty', subtitle: 'Clothing, accessories & more', href: '/category/fashion-beauty' },
  ]

  return (
    <div>
      <HeroBanner />

      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>

        <AdBannerSlot type="leaderboard" />

        <section style={{ marginTop: '36px' }}>
          <CategoryGrid />
        </section>

        <section style={{ marginTop: '36px' }}>
          <TrendingSearches />
        </section>

        {/* Trending Now */}
        <section style={{ marginTop: '48px' }}>
          <SectionHeader
            title="Trending Now"
            subtitle="Most viewed ads in Attock"
          />
          <TrendingAds ads={trendingAds} loading={loading} />
        </section>

        <div style={{ marginTop: '40px' }}>
          <AdBannerSlot type="banner" />
        </div>

        {/* Category Sections */}
        {sections.map((s, i) => (
          <section key={s.category} style={{ marginTop: '48px' }}>
            <SectionHeader
              title={s.title}
              subtitle={s.subtitle}
              href={s.href}
            />
            <RecentAds ads={getAdsByCategory(s.category)} loading={loading} />
            {i === 2 && (
              <div style={{ marginTop: '40px' }}>
                <AdBannerSlot type="leaderboard" />
              </div>
            )}
          </section>
        ))}

      </div>
    </div>
  )
}