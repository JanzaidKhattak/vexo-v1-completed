'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

const DEFAULT_PAGES = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    subtitle: 'By using VEXO you agree to these terms.',
    badge: 'Legal',
    sections: [
      { icon: '✅', title: 'Acceptance of Terms', content: 'By accessing or using VEXO, you confirm that you have read, understood, and agree to be bound by these Terms of Service.' },
      { icon: '👤', title: 'User Responsibilities', content: 'You are solely responsible for all content you post on VEXO. All ads must be accurate, honest, and related to real items available for sale.' },
      { icon: '🚫', title: 'Prohibited Items', content: 'Weapons, illegal drugs, counterfeit goods, stolen items, adult content, and anything illegal under Pakistani law is strictly prohibited.' },
    ]
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'We respect your privacy and protect your data.',
    badge: 'Legal',
    sections: [
      { icon: '📋', title: 'Information We Collect', content: 'We collect your phone number for authentication, your name and email if provided, ads you post, and your general Attock area location.' },
      { icon: '🎯', title: 'How We Use Your Information', content: 'Your information is used to operate the marketplace, verify identity, display ads, send notifications, and provide support.' },
      { icon: '🔒', title: 'Data Storage', content: 'Data is stored on MongoDB Atlas. Images on Cloudinary. We never sell your data to third parties.' },
    ]
  },
  {
    slug: 'help',
    title: 'Help Center',
    subtitle: 'Find answers to frequently asked questions.',
    badge: 'Support',
    sections: [
      { icon: '🚀', title: 'What is VEXO?', content: 'VEXO is a free local classified ads marketplace built exclusively for the Attock community.' },
      { icon: '📋', title: 'How to post an ad?', content: 'Click "+ Post Ad", select category, fill details, upload photos and submit. Ad will be reviewed within 24 hours.' },
      { icon: '💰', title: 'Is VEXO free?', content: 'Yes! VEXO is 100% free. No charges for posting ads or contacting sellers.' },
    ]
  },
]

export default function AdminPagesPage() {
  const { admin } = useAdminAuth()
  const getToken = () => localStorage.getItem('vexo_admin_token')

  const [pages, setPages] = useState([])
  const [selectedSlug, setSelectedSlug] = useState('terms')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pages', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.data.pages.length > 0) {
        const fullPages = await Promise.all(
          DEFAULT_PAGES.map(async (dp) => {
            try {
              const r = await api.get(`/pages/${dp.slug}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
              })
              return r.data.page
            } catch {
              return dp
            }
          })
        )
        setPages(fullPages)
        setEditing(fullPages[0])
      } else {
        setPages(DEFAULT_PAGES)
        setEditing(DEFAULT_PAGES[0])
      }
    } catch {
      setPages(DEFAULT_PAGES)
      setEditing(DEFAULT_PAGES[0])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPage = async (slug) => {
    setSelectedSlug(slug)
    try {
      const res = await api.get(`/pages/${slug}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setEditing(res.data.page)
    } catch {
      setEditing(DEFAULT_PAGES.find(p => p.slug === slug))
    }
  }

  const handleSectionChange = (index, field, value) => {
    const updated = { ...editing }
    updated.sections[index][field] = value
    setEditing(updated)
  }

  const addSection = () => {
    setEditing(prev => ({
      ...prev,
      sections: [...prev.sections, { icon: '📌', title: '', content: '' }]
    }))
  }

  const removeSection = (index) => {
    setEditing(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    if (!editing.title) { toast.error('Title required'); return }
    setSaving(true)
    try {
      await api.post('/pages', editing, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      toast.success('Page saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Loading...</p>

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '4px' }}>
        Page Manager
      </h1>
      <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '24px', fontSize: '14px' }}>
        Edit Terms, Privacy Policy and Help page content
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>

        {/* Sidebar */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0', height: 'fit-content' }}>
          {DEFAULT_PAGES.map(p => (
            <button key={p.slug} onClick={() => handleSelectPage(p.slug)} style={{
              width: '100%', padding: '10px 12px', textAlign: 'left',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600',
              marginBottom: '4px',
              background: selectedSlug === p.slug ? '#EDE9FE' : 'transparent',
              color: selectedSlug === p.slug ? '#6C3AF5' : '#64748B',
            }}>
              {p.slug === 'terms' && '📄 '}
              {p.slug === 'privacy-policy' && '🔒 '}
              {p.slug === 'help' && '❓ '}
              {p.title}
            </button>
          ))}
        </div>

        {/* Editor */}
        {editing && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>PAGE TITLE</label>
                  <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>BADGE</label>
                  <input value={editing.badge || ''} onChange={e => setEditing({ ...editing, badge: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>SUBTITLE</label>
                <input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Inter, sans-serif', color: '#0f172a' }}>Sections ({editing.sections?.length})</h3>
                <button onClick={addSection} style={{
                  padding: '6px 14px', background: '#6C3AF5',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                }}>+ Add Section</button>
              </div>

              {editing.sections?.map((section, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '12px', background: '#F8FAFC' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>ICON</label>
                      <input value={section.icon} onChange={e => handleSectionChange(i, 'icon', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1.5px solid #E2E8F0', borderRadius: '8px', textAlign: 'center', fontSize: '18px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>TITLE</label>
                      <input value={section.title} onChange={e => handleSectionChange(i, 'title', e.target.value)} placeholder="Section title"
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button onClick={() => removeSection(i)} style={{ marginTop: '20px', padding: '8px 10px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>CONTENT</label>
                    <textarea value={section.content} onChange={e => handleSectionChange(i, 'content', e.target.value)}
                      rows={3} placeholder="Section content..."
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              padding: '12px 28px', background: '#6C3AF5', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', fontFamily: 'Inter, sans-serif',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? '⏳ Saving...' : '💾 Save Page'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}