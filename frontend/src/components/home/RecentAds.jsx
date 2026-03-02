import AdGrid from '../ads/AdGrid'

export default function RecentAds({ ads = [], cols = 4 }) {
  return <AdGrid ads={ads} cols={cols} />
}