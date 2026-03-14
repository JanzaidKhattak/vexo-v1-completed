'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

const getToken = () => localStorage.getItem('vexo_admin_token')

const statusConfig = {
  pending:   { bg: '#FEF9C3', color: '#A16207', label: 'Pending' },
  resolved:  { bg: '#DCFCE7', color: '#15803D', label: 'Resolved' },
  dismissed: { bg: '#F1F5F9', color: '#64748B', label: 'Dismissed' },
  reviewed:  { bg: '#EDE9FE', color: '#6D28D9', label: 'Reviewed' },
}

const actionConfig = {
  ad_blocked:   { bg: '#FEE2E2', color: '#B91C1C', label: 'Ad Blocked' },
  user_blocked: { bg: '#FEE2E2', color: '#7F1D1D', label: 'User Blocked' },
  ignored:      { bg: '#F1F5F9', color: '#64748B', label: 'No Action' },
  none:         { bg: '#F1F5F9', color: '#64748B', label: 'Awaiting' },
}

// ── Action Modal ──────────────────────────────────────────────────────────────
function ActionModal({ report, onClose, onDone }) {
  const [action, setAction] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const actions = [
    {
      key: 'block_ad',
      label: 'Block Ad',
      desc: 'Remove this ad from public listing. The seller will be notified.',
      danger: true,
    },
    {
      key: 'block_user',
      label: 'Block User',
      desc: 'Permanently ban the seller. All their ads will be removed.',
      danger: true,
    },
    {
      key: 'resolve',
      label: 'Mark Resolved',
      desc: 'Ad stays live. Report is closed as resolved with no action taken.',
      danger: false,
    },
    {
      key: 'dismiss',
      label: 'Dismiss Report',
      desc: 'Dismiss this report as invalid or not actionable.',
      danger: false,
    },
  ]

  const handleSubmit = async () => {
    if (!action) { toast.error('Select an action'); return }
    setLoading(true)
    try {
      await api.patch(`/reports/${report._id}/action`, { action, actionNote: note }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      toast.success('Action taken!')
      onDone()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', margin: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'slideUp 0.25s ease', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>Take Action</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
              Report #{report._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F8FAFC', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}>✕</button>
        </div>

        {/* Report Summary */}
        <div style={{ padding: '18px 28px', background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {report.ad?.images?.[0] && (
              <img src={report.ad.images[0]} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, border: '1px solid #E2E8F0' }} />
            )}
            <div>
              <p style={{ fontWeight: '700', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                {report.ad?.title || 'Ad Deleted'}
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
                Ad ID: <span style={{ fontWeight: '700', color: '#374151' }}>#{String(report.ad?._id || '').slice(-8).toUpperCase()}</span>
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF2F2', padding: '4px 10px', borderRadius: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#B91C1C', fontFamily: "'DM Sans', sans-serif" }}>{report.reason}</span>
              </div>
            </div>
          </div>
          {(report.comment || report.description) && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '12px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
                "{report.comment || report.description}"
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 28px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Select Action
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {actions.map(a => (
              <label key={a.key} style={{
                display: 'flex', gap: '12px', padding: '13px 16px', borderRadius: '12px',
                cursor: 'pointer', border: `1.5px solid ${action === a.key ? (a.danger ? '#FCA5A5' : '#6C3AF5') : '#E2E8F0'}`,
                background: action === a.key ? (a.danger ? '#FEF2F2' : '#FAF5FF') : 'white',
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="action" value={a.key} checked={action === a.key} onChange={() => setAction(a.key)}
                  style={{ accentColor: a.danger ? '#EF4444' : '#6C3AF5', width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: '700', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: action === a.key ? (a.danger ? '#B91C1C' : '#6C3AF5') : '#374151', marginBottom: '2px' }}>
                    {a.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.5' }}>
                    {a.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Admin Note (optional)
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add internal note about this action..." rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', boxSizing: 'border-box', color: '#374151' }}
              onFocus={e => e.target.style.borderColor = '#6C3AF5'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} disabled={!action || loading} style={{
              flex: 1, padding: '13px', background: action && ['block_ad', 'block_user'].includes(action) ? '#EF4444' : '#6C3AF5',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
              cursor: !action || loading ? 'not-allowed' : 'pointer',
              opacity: !action || loading ? 0.6 : 1, transition: 'all 0.15s',
            }}>
              {loading ? 'Processing...' : 'Confirm Action'}
            </button>
            <button onClick={onClose} style={{ padding: '13px 20px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({ pending: 0, resolved: 0, dismissed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => { fetchAll() }, [statusFilter])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rRes, sRes] = await Promise.all([
        api.get(`/reports?status=${statusFilter}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        api.get('/reports/stats', { headers: { Authorization: `Bearer ${getToken()}` } }).catch(() => ({ data: { stats: {} } })),
      ])
      setReports(rRes.data.reports || [])
      setStats(sRes.data.stats || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const filters = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
    { key: 'dismissed', label: 'Dismissed', count: stats.dismissed },
  ]

  return (
    <div style={{ padding: '32px', background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .report-row:hover { border-color: #C4B5FD !important; box-shadow: 0 4px 16px rgba(108,58,245,0.07) !important; }
        .action-btn:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
        .filter-btn:hover { border-color: #6C3AF5 !important; color: #6C3AF5 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Reports
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
          Review and take action on reported ads
        </p>
      </div>

      {/* Stats Cards */}
      <div className='admin-stats-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px', animation: 'fadeUp 0.4s ease 0.05s both' }}>
        {[
          { label: 'Total Reports', value: stats.total || 0, bg: '#F8FAFC', color: '#0f172a', border: '#E2E8F0' },
          { label: 'Pending', value: stats.pending || 0, bg: '#FFFBEB', color: '#A16207', border: '#FCD34D' },
          { label: 'Resolved', value: stats.resolved || 0, bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
          { label: 'Dismissed', value: stats.dismissed || 0, bg: '#F8FAFC', color: '#64748B', border: '#CBD5E1' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '18px 20px', border: `1px solid ${s.border}` }}>
            <p style={{ fontSize: '28px', fontWeight: '900', color: s.color, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
              {s.value}
            </p>
            <p style={{ fontSize: '12px', color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: '600', opacity: 0.75 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)} className="filter-btn" style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.15s',
            border: `1.5px solid ${statusFilter === f.key ? '#6C3AF5' : '#E2E8F0'}`,
            background: statusFilter === f.key ? '#6C3AF5' : 'white',
            color: statusFilter === f.key ? 'white' : '#64748B',
          }}>
            {f.label} {f.count > 0 && <span style={{ marginLeft: '4px', opacity: 0.8 }}>({f.count})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
      ) : reports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</p>
          <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '600', fontSize: '15px' }}>No reports found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.4s ease 0.15s both' }}>
          {reports.map(report => {
            const sc = statusConfig[report.status] || statusConfig.pending
            const ac = actionConfig[report.adminAction] || actionConfig.none
            const reporterName = [report.reportedBy?.firstName, report.reportedBy?.lastName].filter(Boolean).join(' ') || report.reportedBy?.email || 'Unknown'

            return (
              <div key={report._id} className="report-row" style={{
                background: 'white', borderRadius: '16px', padding: '20px 24px',
                border: `1.5px solid ${report.status === 'pending' ? '#FCD34D' : '#E2E8F0'}`,
                transition: 'all 0.2s', animation: 'fadeUp 0.3s ease',
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                  {/* Ad Image */}
                  <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: '#F8FAFC', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                    {report.ad?.images?.[0] ? (
                      <img src={report.ad.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                  </div>

                  {/* Main Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: '800', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#0f172a' }}>
                        {report.ad?.title || 'Ad Deleted'}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", background: '#F8FAFC', padding: '2px 8px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        ID: #{String(report.ad?._id || '').slice(-8).toUpperCase()}
                      </span>
                    </div>

                    {/* Reason Badge */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        {report.reason}
                      </span>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      {report.adminAction && report.adminAction !== 'none' && (
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", background: ac.bg, color: ac.color }}>
                          {ac.label}
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    {(report.comment || report.description) && (
                      <p style={{ fontSize: '12px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', marginBottom: '8px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #E2E8F0' }}>
                        "{report.comment || report.description}"
                      </p>
                    )}

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                        Reported by <strong style={{ color: '#475569' }}>{reporterName}</strong>
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                        {timeAgo(report.createdAt)}
                      </span>
                      {report.ad?.price && (
                        <span style={{ fontSize: '12px', color: '#6C3AF5', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" }}>
                          Rs {report.ad.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Admin action note */}
                    {report.actionNote && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: '#EDE9FE', borderRadius: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#5B21B6', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                          Admin note: {report.actionNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '140px' }}>
                    <button
                      onClick={() => window.open(`/ads/${report.ad?._id}`, '_blank')}
                      className="action-btn"
                      style={{ padding: '8px 14px', background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
                    >
                      View Ad
                    </button>

                    {report.status === 'pending' && (
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="action-btn"
                        style={{ padding: '8px 14px', background: '#6C3AF5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
                      >
                        Take Action
                      </button>
                    )}

                    {report.status !== 'pending' && report.actionBy && (
                      <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
                        By {[report.actionBy?.firstName, report.actionBy?.lastName].filter(Boolean).join(' ') || 'Admin'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedReport && (
        <ActionModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDone={() => { setSelectedReport(null); fetchAll() }}
        />
      )}
    </div>
  )
}