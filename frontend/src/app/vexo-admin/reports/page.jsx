'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

const gT = () => localStorage.getItem('vexo_admin_token')
const hdr = () => ({ Authorization: `Bearer ${gT()}` })

const STATUS_CFG = {
  pending:   { bg: '#FFFBEB', color: '#A16207', label: 'Pending' },
  resolved:  { bg: '#F0FDF4', color: '#15803D', label: 'Resolved' },
  dismissed: { bg: '#F1F5F9', color: '#64748B', label: 'Dismissed' },
}

const ACTION_CFG = {
  ad_blocked:   { bg: '#FEF2F2', color: '#B91C1C', label: '🚫 Ad Blocked' },
  user_blocked: { bg: '#FEF2F2', color: '#7F1D1D', label: '🔴 User Blocked' },
  warned:       { bg: '#FEF3C7', color: '#92400E', label: '⚠️ Warned' },
  ad_unblocked: { bg: '#F0FDF4', color: '#15803D', label: '✅ Restored' },
  ignored:      { bg: '#F1F5F9', color: '#64748B', label: 'No Action' },
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
function ActionModal({ report, onClose, onDone }) {
  const [action,  setAction]  = useState('')
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)

  const ACTIONS = [
    { key: 'block_ad',    icon: '🚫', label: 'Block Ad',      desc: 'Hide ad from listing. Seller notified. Reversible anytime.', danger: true },
    { key: 'block_user',  icon: '🔴', label: 'Block User',    desc: 'Suspend account + hide all their ads. Reversible anytime.',  danger: true },
    { key: 'warn_seller', icon: '⚠️', label: 'Warn Seller',   desc: 'Send warning to seller. Ad stays live.',                     danger: false },
    { key: 'resolve',     icon: '✅', label: 'Mark Resolved', desc: 'Close report with no action. Ad stays live.',                danger: false },
    { key: 'dismiss',     icon: '❌', label: 'Dismiss',       desc: 'Mark as invalid or not actionable.',                        danger: false },
  ]

  const submit = async () => {
    if (!action) { toast.error('Select an action'); return }
    setLoading(true)
    try {
      await api.patch(`/reports/${report._id}/action`, { action, actionNote: note }, { headers: hdr() })
      toast.success('Action applied!')
      onDone()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)', padding:'20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'480px', overflow:'hidden', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h3 style={{ fontSize:'17px', fontWeight:'800', color:'#0f172a', fontFamily:"'DM Sans', sans-serif" }}>Take Action</h3>
            <p style={{ fontSize:'12px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif", marginTop:'2px' }}>Report #{report._id?.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#F8FAFC', border:'none', cursor:'pointer', fontSize:'14px', color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Ad summary */}
        <div style={{ padding:'14px 24px', background:'#FAFAFA', borderBottom:'1px solid #F1F5F9', display:'flex', gap:'12px', alignItems:'center' }}>
          {report.ad?.images?.[0] && <img src={report.ad.images[0]} alt="" style={{ width:'52px', height:'52px', borderRadius:'8px', objectFit:'cover', border:'1px solid #E2E8F0', flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:'700', fontSize:'14px', color:'#0f172a', fontFamily:"'DM Sans', sans-serif", marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{report.ad?.title || 'Ad Deleted'}</p>
            <span style={{ background:'#FEF2F2', color:'#B91C1C', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', fontFamily:"'DM Sans', sans-serif" }}>🚩 {report.reason}</span>
            {report.comment && <p style={{ fontSize:'12px', color:'#64748B', fontFamily:"'DM Sans', sans-serif", marginTop:'5px', fontStyle:'italic' }}>"{report.comment}"</p>}
          </div>
        </div>

        {/* Action options */}
        <div style={{ padding:'16px 24px' }}>
          <p style={{ fontSize:'11px', fontWeight:'700', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'DM Sans', sans-serif", marginBottom:'10px' }}>Choose Action</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
            {ACTIONS.map(a => (
              <label key={a.key} style={{ display:'flex', gap:'12px', padding:'11px 14px', borderRadius:'10px', cursor:'pointer', border:`1.5px solid ${action === a.key ? (a.danger ? '#FCA5A5' : '#A78BFA') : '#E2E8F0'}`, background: action === a.key ? (a.danger ? '#FEF2F2' : '#FAF5FF') : 'white', transition:'all 0.15s' }}>
                <input type="radio" name="act" value={a.key} checked={action === a.key} onChange={() => setAction(a.key)} style={{ accentColor: a.danger ? '#EF4444' : '#6C3AF5', marginTop:'3px', flexShrink:0 }} />
                <div>
                  <p style={{ fontWeight:'700', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", color: action === a.key ? (a.danger ? '#B91C1C' : '#6C3AF5') : '#374151', marginBottom:'2px' }}>{a.icon} {a.label}</p>
                  <p style={{ fontSize:'12px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif", lineHeight:'1.5' }}>{a.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'DM Sans', sans-serif", marginBottom:'6px' }}>Admin Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Internal note / reason..." rows={2}
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none', resize:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6C3AF5'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>

          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={submit} disabled={!action || loading} style={{ flex:1, padding:'12px', background: action && ['block_ad','block_user'].includes(action) ? '#EF4444' : '#6C3AF5', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor: (!action || loading) ? 'not-allowed' : 'pointer', opacity: (!action || loading) ? 0.6 : 1 }}>
              {loading ? 'Processing...' : 'Confirm'}
            </button>
            <button onClick={onClose} style={{ padding:'12px 20px', background:'#F1F5F9', color:'#64748B', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', fontFamily:"'DM Sans', sans-serif", cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [tab,          setTab]          = useState('reports')
  const [reports,      setReports]      = useState([])
  const [blockedAds,   setBlockedAds]   = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [stats,        setStats]        = useState({})
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('all')
  const [selected,     setSelected]     = useState(null)

  useEffect(() => { fetchData() }, [tab, filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const sRes = await api.get('/reports/stats', { headers: hdr() })
      setStats(sRes.data.stats || {})
      if (tab === 'reports') {
        const r = await api.get(`/reports?status=${filter}`, { headers: hdr() })
        setReports(r.data.reports || [])
      } else if (tab === 'blocked-ads') {
        const r = await api.get('/reports/blocked-ads', { headers: hdr() })
        setBlockedAds(r.data.ads || [])
      } else if (tab === 'blocked-users') {
        const r = await api.get('/reports/blocked-users', { headers: hdr() })
        setBlockedUsers(r.data.users || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const unblockAd = async (id) => {
    if (!confirm('Restore this ad to live listing?')) return
    try {
      await api.patch(`/reports/unblock-ad/${id}`, {}, { headers: hdr() })
      toast.success('Ad restored & seller notified!')
      fetchData()
    } catch { toast.error('Failed') }
  }

  const unblockUser = async (id) => {
    if (!confirm('Restore this user account?')) return
    try {
      await api.patch(`/reports/unblock-user/${id}`, {}, { headers: hdr() })
      toast.success('User restored & notified!')
      fetchData()
    } catch { toast.error('Failed') }
  }

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h/24)}d ago`
  }

  const TABS = [
    { key:'reports',       label:'📋 Reports',       badge: stats.pending,      badgeBg:'#FCD34D',  badgeColor:'#92400E' },
    { key:'blocked-ads',   label:'🚫 Blocked Ads',   badge: stats.blockedAds,   badgeBg:'#FCA5A5',  badgeColor:'#B91C1C' },
    { key:'blocked-users', label:'🔴 Blocked Users', badge: stats.blockedUsers, badgeBg:'#FECACA',  badgeColor:'#7F1D1D' },
  ]

  return (
    <div style={{ padding:'28px 32px', background:'#F8FAFC', minHeight:'100vh' }}>
      <style>{`
        .r-row { transition: all 0.18s ease; }
        .r-row:hover { box-shadow: 0 4px 18px rgba(108,58,245,0.08) !important; border-color: #C4B5FD !important; }
        .act-btn { transition: all 0.15s ease !important; }
        .act-btn:hover { transform: translateY(-1px) !important; opacity: 0.88 !important; }
        @media (max-width: 768px) {
          .reports-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .report-row-inner { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'900', color:'#0f172a', fontFamily:"'DM Sans', sans-serif", letterSpacing:'-0.02em', marginBottom:'4px' }}>Reports & Moderation</h1>
        <p style={{ color:'#94A3B8', fontSize:'13px', fontFamily:"'DM Sans', sans-serif" }}>Review reports · Block/unblock ads & users · Full audit trail</p>
      </div>

      {/* Stats cards */}
      <div className="reports-stats" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'24px' }}>
        {[
          { label:'Total',         val: stats.total       || 0, bg:'white',    color:'#0f172a', bdr:'#E2E8F0' },
          { label:'Pending',       val: stats.pending     || 0, bg:'#FFFBEB',  color:'#A16207', bdr:'#FCD34D' },
          { label:'Resolved',      val: stats.resolved    || 0, bg:'#F0FDF4',  color:'#15803D', bdr:'#86EFAC' },
          { label:'Blocked Ads',   val: stats.blockedAds  || 0, bg:'#FEF2F2',  color:'#B91C1C', bdr:'#FCA5A5' },
          { label:'Blocked Users', val: stats.blockedUsers|| 0, bg:'#FEF2F2',  color:'#7F1D1D', bdr:'#FECACA' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'16px 18px', border:`1px solid ${s.bdr}` }}>
            <p style={{ fontSize:'28px', fontWeight:'900', color:s.color, fontFamily:"'DM Sans', sans-serif", letterSpacing:'-0.03em', lineHeight:1, marginBottom:'4px' }}>{s.val}</p>
            <p style={{ fontSize:'11px', fontWeight:'700', color:s.color, opacity:0.7, fontFamily:"'DM Sans', sans-serif", textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', borderRadius:'10px', fontSize:'13px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer', border:`1.5px solid ${tab === t.key ? '#6C3AF5' : '#E2E8F0'}`, background: tab === t.key ? '#6C3AF5' : 'white', color: tab === t.key ? 'white' : '#64748B', transition:'all 0.15s' }}>
            {t.label}
            {t.badge > 0 && <span style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : t.badgeBg, color: tab === t.key ? 'white' : t.badgeColor, fontSize:'11px', fontWeight:'800', padding:'1px 7px', borderRadius:'20px', fontFamily:"'DM Sans', sans-serif" }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── REPORTS TAB ── */}
      {tab === 'reports' && (
        <>
          <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
            {['all','pending','resolved','dismissed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', fontFamily:"'DM Sans', sans-serif", cursor:'pointer', border:`1.5px solid ${filter===f ? '#6C3AF5' : '#E2E8F0'}`, background: filter===f ? '#EDE9FE' : 'white', color: filter===f ? '#6C3AF5' : '#64748B' }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? <Loader /> : reports.length === 0 ? <Empty icon="🎉" msg="No reports found" /> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {reports.map(r => {
                const sc = STATUS_CFG[r.status] || STATUS_CFG.pending
                const ac = ACTION_CFG[r.adminAction]
                const name = [r.reportedBy?.firstName, r.reportedBy?.lastName].filter(Boolean).join(' ') || r.reportedBy?.email || 'Unknown'
                return (
                  <div key={r._id} className="r-row" style={{ background:'white', borderRadius:'14px', padding:'16px 20px', border:`1.5px solid ${r.status==='pending' ? '#FCD34D' : '#E2E8F0'}` }}>
                    <div className="report-row-inner" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                      {/* Thumb */}
                      <div style={{ width:'60px', height:'60px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'#F8FAFC', border:'1px solid #E2E8F0' }}>
                        {r.ad?.images?.[0] ? <img src={r.ad.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>📷</div>}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'5px' }}>
                          <p style={{ fontWeight:'800', fontSize:'15px', color:'#0f172a', fontFamily:"'DM Sans', sans-serif" }}>{r.ad?.title || 'Ad Deleted'}</p>
                          <span style={{ fontSize:'10px', color:'#94A3B8', background:'#F8FAFC', padding:'2px 6px', borderRadius:'20px', border:'1px solid #E2E8F0', fontFamily:"'DM Sans', sans-serif" }}>#{String(r.ad?._id||'').slice(-8).toUpperCase()}</span>
                        </div>
                        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'7px' }}>
                          <span style={{ background:'#FEF2F2', color:'#B91C1C', fontSize:'11px', fontWeight:'700', padding:'3px 9px', borderRadius:'20px', fontFamily:"'DM Sans', sans-serif" }}>🚩 {r.reason}</span>
                          <span style={{ background:sc.bg, color:sc.color, fontSize:'11px', fontWeight:'700', padding:'3px 9px', borderRadius:'20px', fontFamily:"'DM Sans', sans-serif" }}>{sc.label}</span>
                          {ac && <span style={{ background:ac.bg, color:ac.color, fontSize:'11px', fontWeight:'700', padding:'3px 9px', borderRadius:'20px', fontFamily:"'DM Sans', sans-serif" }}>{ac.label}</span>}
                        </div>
                        {r.comment && <p style={{ fontSize:'12px', color:'#64748B', fontFamily:"'DM Sans', sans-serif", fontStyle:'italic', marginBottom:'6px' }}>"{r.comment}"</p>}
                        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                          <span style={{ fontSize:'12px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif" }}>By <strong style={{ color:'#475569' }}>{name}</strong></span>
                          <span style={{ fontSize:'12px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif" }}>{timeAgo(r.createdAt)}</span>
                          {r.ad?.price && <span style={{ fontSize:'12px', color:'#6C3AF5', fontWeight:'700', fontFamily:"'DM Sans', sans-serif" }}>Rs {r.ad.price.toLocaleString()}</span>}
                        </div>
                        {r.actionNote && <p style={{ fontSize:'11px', color:'#6C3AF5', fontFamily:"'DM Sans', sans-serif", marginTop:'4px' }}>📝 {r.actionNote}</p>}
                      </div>
                      {/* Actions */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'7px', flexShrink:0 }}>
                        {r.ad?._id && (
                          <button onClick={() => window.open(`/ads/${r.ad._id}`, '_blank')} className="act-btn"
                            style={{ padding:'7px 14px', background:'#EFF6FF', color:'#1D4ED8', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer' }}>
                            View Ad
                          </button>
                        )}
                        {r.status === 'pending' && (
                          <button onClick={() => setSelected(r)} className="act-btn"
                            style={{ padding:'7px 14px', background:'#6C3AF5', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer' }}>
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── BLOCKED ADS TAB ── */}
      {tab === 'blocked-ads' && (
        loading ? <Loader /> : blockedAds.length === 0 ? <Empty icon="✅" msg="No blocked ads" /> : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {blockedAds.map(ad => (
              <div key={ad._id} className="r-row" style={{ background:'white', borderRadius:'14px', padding:'16px 20px', border:'1.5px solid #FCA5A5', display:'flex', gap:'14px', alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ width:'60px', height:'60px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'#F8FAFC', border:'1px solid #E2E8F0' }}>
                  {ad.images?.[0] ? <img src={ad.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>📷</div>}
                </div>
                <div style={{ flex:1, minWidth:'160px' }}>
                  <p style={{ fontWeight:'800', fontSize:'15px', color:'#0f172a', fontFamily:"'DM Sans', sans-serif", marginBottom:'3px' }}>{ad.title}</p>
                  <p style={{ fontSize:'13px', color:'#6C3AF5', fontWeight:'800', fontFamily:"'DM Sans', sans-serif", marginBottom:'3px' }}>Rs {ad.price?.toLocaleString()}</p>
                  <p style={{ fontSize:'12px', color:'#64748B', fontFamily:"'DM Sans', sans-serif" }}>Seller: <strong>{ad.seller?.firstName} {ad.seller?.lastName}</strong> · {ad.seller?.email}</p>
                  {ad.blockReason && <p style={{ fontSize:'11px', color:'#B91C1C', fontFamily:"'DM Sans', sans-serif", marginTop:'3px' }}>Reason: {ad.blockReason}</p>}
                </div>
                <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                  {ad._id && <button onClick={() => window.open(`/ads/${ad._id}`, '_blank')} className="act-btn" style={{ padding:'8px 14px', background:'#EFF6FF', color:'#1D4ED8', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer' }}>View</button>}
                  <button onClick={() => unblockAd(ad._id)} className="act-btn"
                    style={{ padding:'8px 16px', background:'#F0FDF4', color:'#15803D', border:'1.5px solid #86EFAC', borderRadius:'8px', fontSize:'12px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer' }}>
                    ✅ Restore Ad
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── BLOCKED USERS TAB ── */}
      {tab === 'blocked-users' && (
        loading ? <Loader /> : blockedUsers.length === 0 ? <Empty icon="✅" msg="No blocked users" /> : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {blockedUsers.map(u => {
              const name = `${u.firstName||''} ${u.lastName||''}`.trim() || 'Unknown'
              const init = (u.firstName?.charAt(0)||'U').toUpperCase()
              return (
                <div key={u._id} className="r-row" style={{ background:'white', borderRadius:'14px', padding:'16px 20px', border:'1.5px solid #FECACA', display:'flex', gap:'14px', alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'12px', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#EF4444,#B91C1C)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ color:'white', fontWeight:'900', fontSize:'18px', fontFamily:"'DM Sans', sans-serif" }}>{init}</span>}
                  </div>
                  <div style={{ flex:1, minWidth:'160px' }}>
                    <p style={{ fontWeight:'800', fontSize:'15px', color:'#0f172a', fontFamily:"'DM Sans', sans-serif", marginBottom:'2px' }}>{name}</p>
                    <p style={{ fontSize:'12px', color:'#64748B', fontFamily:"'DM Sans', sans-serif", marginBottom:'2px' }}>{u.email}</p>
                    {u.blockReason && <p style={{ fontSize:'11px', color:'#B91C1C', fontFamily:"'DM Sans', sans-serif" }}>Reason: {u.blockReason}</p>}
                    {u.blockedAt && <p style={{ fontSize:'11px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif" }}>Blocked {timeAgo(u.blockedAt)}</p>}
                  </div>
                  <button onClick={() => unblockUser(u._id)} className="act-btn"
                    style={{ padding:'8px 16px', background:'#F0FDF4', color:'#15803D', border:'1.5px solid #86EFAC', borderRadius:'8px', fontSize:'12px', fontWeight:'700', fontFamily:"'DM Sans', sans-serif", cursor:'pointer', flexShrink:0 }}>
                    ✅ Restore User
                  </button>
                </div>
              )
            })}
          </div>
        )
      )}

      {selected && <ActionModal report={selected} onClose={() => setSelected(null)} onDone={() => { setSelected(null); fetchData() }} />}
    </div>
  )
}

const Loader = () => <div style={{ textAlign:'center', padding:'60px', color:'#94A3B8', fontFamily:"'DM Sans', sans-serif", fontSize:'14px' }}>Loading...</div>
const Empty  = ({ icon, msg }) => (
  <div style={{ background:'white', borderRadius:'16px', padding:'60px', textAlign:'center', border:'1px solid #E2E8F0' }}>
    <p style={{ fontSize:'36px', marginBottom:'12px' }}>{icon}</p>
    <p style={{ color:'#94A3B8', fontFamily:"'DM Sans', sans-serif", fontWeight:'600', fontSize:'14px' }}>{msg}</p>
  </div>
)