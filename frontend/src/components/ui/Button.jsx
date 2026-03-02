import { Spinner } from './Spinner'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer border-none outline-none'

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    dark: 'btn-dark',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 rounded-xl px-4 py-2',
    danger: 'bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-2.5 shadow-sm',
  }

  const sizes = {
    sm: 'text-xs px-3 py-2 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  )
}