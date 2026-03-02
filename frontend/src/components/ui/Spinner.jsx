export function Spinner({ size = 'md', color = 'brand' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  const colors = {
    brand: 'border-gray-200 border-t-[#FF4B26]',
    white: 'border-white/30 border-t-white',
    dark:  'border-gray-200 border-t-gray-800',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        ${colors[color]}
        rounded-full animate-spin inline-block
      `}
    />
  )
}

export default function SpinnerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}