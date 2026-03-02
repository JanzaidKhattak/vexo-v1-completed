import AdGrid from '../ads/AdGrid'

export default function TrendingAds({ ads = [] }) {
  return <AdGrid ads={ads} cols={4} />
}