export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    sold:     'badge-sold',
    default:  'badge-sold',
    new: '',
    featured: '',
  }

  const inlineVariants = {
    new: {
      background: '#EFF6FF',
      color: '#2563EB',
    },
    featured: {
      background: '#FFF7ED',
      color: '#EA580C',
    },
  }

  if (inlineVariants[variant]) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
        style={inlineVariants[variant]}
      >
        {children}
      </span>
    )
  }

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}