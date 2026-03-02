'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports')
      setReports(res.data.reports)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status })
      toast.success('Report updated!')
      fetchReports()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '24px' }}>
        Reports
      </h1>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading...</p>
      ) : reports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid var(--border-default)' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>No reports yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map(report => (
            <div key={report._id} style={{
              background: 'white', borderRadius: '12px', padding: '20px',
              border: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  {report.ad?.images?.[0] && (
  <img src={report.ad.images[0]} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
)}
                  <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
                    {report.ad?.title || 'Ad Deleted'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                    Reported by: {report.reportedBy?.phone || 'Unknown'} • Reason: {report.reason}
                  </p>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                    fontWeight: '600', fontFamily: 'Inter, sans-serif',
                    background: report.status === 'pending' ? '#fef3c7' : report.status === 'resolved' ? '#d1fae5' : '#fee2e2',
                    color: report.status === 'pending' ? '#92400e' : report.status === 'resolved' ? '#065f46' : '#991b1b',
                  }}>
                    {report.status}
                  </span>
                </div>
                {report.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatus(report._id, 'resolved')} style={{
                      padding: '6px 14px', background: '#10B981', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>Resolve</button>
                    <button onClick={() => handleStatus(report._id, 'dismissed')} style={{
                      padding: '6px 14px', background: '#6B7280', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}