'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareAdButton({ ad }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const text = `${ad?.title} — Rs ${ad?.price?.toLocaleString()}\nAttock, Pakistan\n${url}`

    // WhatsApp share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    if (navigator.share) {
      try {
        await navigator.share({ title: ad?.title, text, url })
      } catch {}
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        window.open(whatsappUrl, '_blank')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: copied ? '#D1FAE5' : 'var(--bg-secondary)',
        border: `1.5px solid ${copied ? '#10B981' : 'var(--border-default)'}`,
        borderRadius: '12px',
        color: copied ? '#059669' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.borderColor = 'var(--brand-primary)'
          e.currentTarget.style.color = 'var(--brand-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.background = 'var(--bg-secondary)'
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}