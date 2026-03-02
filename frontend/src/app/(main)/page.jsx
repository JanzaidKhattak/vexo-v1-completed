'use client'

import { useState, useEffect } from 'react'
import HeroBanner from '../../components/home/HeroBanner'
import CategoryGrid from '../../components/home/CategoryGrid'
import TrendingSearches from '../../components/home/TrendingSearches'
import TrendingAds from '../../components/home/TrendingAds'
import RecentAds from '../../components/home/RecentAds'
import AdBannerSlot from '../../components/home/AdBannerSlot'
import api from '../../lib/axios'

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
        api.get('/ads/recent'),
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

  return (
    <div>
      <HeroBanner />

      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>

        <AdBannerSlot type="leaderboard" />

        <section style={{ marginTop: '36px' }}>
          <CategoryGrid />
        </section>

        <section style={{ marginTop: '36px' }}>
          <TrendingSearches />
        </section>

        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 className="section-title">🔥 Trending Now</h2>
              <p className="section-subtitle">Most viewed ads in Attock</p>
            </div>
          </div>
          <TrendingAds ads={trendingAds} loading={loading} />
        </section>

        <div style={{ marginTop: '40px' }}>
          <AdBannerSlot type="banner" />
        </div>

        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 className="section-title">📱 Latest Mobiles</h2>
              <p className="section-subtitle">Fresh mobile listings in Attock</p>
            </div>
            <a href="/category/mobiles" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', textDecoration: 'none' }}>View All →</a>
          </div>
          <RecentAds ads={getAdsByCategory('mobiles')} loading={loading} />
        </section>

        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 className="section-title">🚗 Cars for Sale</h2>
              <p className="section-subtitle">Find your next car in Attock</p>
            </div>
            <a href="/category/cars" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', textDecoration: 'none' }}>View All →</a>
          </div>
          <RecentAds ads={getAdsByCategory('cars')} loading={loading} />
        </section>

        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 className="section-title">🏍️ Motorcycles</h2>
              <p className="section-subtitle">Bikes available in Attock</p>
            </div>
            <a href="/category/motorcycles" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', textDecoration: 'none' }}>View All →</a>
          </div>
          <RecentAds ads={getAdsByCategory('motorcycles')} loading={loading} />
        </section>

        <div style={{ marginTop: '40px' }}>
          <AdBannerSlot type="leaderboard" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '40px' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 className="section-title">💻 Electronics</h2>
                <p className="section-subtitle">TVs, ACs & more</p>
              </div>
              <a href="/category/electronics" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', textDecoration: 'none' }}>View All →</a>
            </div>
            <RecentAds ads={getAdsByCategory('electronics')} cols={1} loading={loading} />
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 className="section-title">🛋️ Furniture & Home</h2>
                <p className="section-subtitle">Home essentials</p>
              </div>
              <a href="/category/furniture" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', textDecoration: 'none' }}>View All →</a>
            </div>
            <RecentAds ads={getAdsByCategory('furniture')} cols={1} loading={loading} />
          </section>
        </div>

      </div>
    </div>
  )
}