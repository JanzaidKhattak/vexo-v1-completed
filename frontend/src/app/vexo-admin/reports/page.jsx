'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('vexo_admin_token')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setReports(res.data.reports)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      toast.success('Report updated!')
      fetchReports()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Reports
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          {reports.length} total reports
        </p>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Loading...</p>
      ) : reports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</p>
          <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>No reports yet!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map(report => (
            <div key={report._id} style={{
              background: 'white', borderRadius: '14px', padding: '20px',
              border: `1px solid ${report.status === 'pending' ? '#FCD34D' : '#E2E8F0'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                  {report.ad?.images?.[0] && (
                    <img src={report.ad.images[0]} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                  )}
                  <div>
                    <p style={{ fontWeight: '700', fontFamily: 'Inter, sans-serif', color: '#0f172a', marginBottom: '4px' }}>
                      {report.ad?.title || 'Ad Deleted'}
                    </p>
                    <p style={{ color: '#64748B', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                      Reported by: <strong>{report.reportedBy?.email || report.reportedBy?.phone || 'Unknown'}</strong>
                    </p>
                    <p style={{ color: '#64748B', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
                      Reason: <strong>{report.reason}</strong>
                    </p>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif',
                      background: report.status === 'pending' ? '#FEF3C7' : report.status === 'resolved' ? '#D1FAE5' : '#F1F5F9',
                      color: report.status === 'pending' ? '#92400E' : report.status === 'resolved' ? '#065F46' : '#64748B',
                    }}>
                      {report.status === 'pending' ? '⏳ Pending' : report.status === 'resolved' ? '✅ Resolved' : '🚫 Dismissed'}
                    </span>
                  </div>
                </div>
                {report.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatus(report._id, 'resolved')} style={{
                      padding: '8px 16px', background: '#10B981', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>✅ Resolve</button>
                    <button onClick={() => handleStatus(report._id, 'dismissed')} style={{
                      padding: '8px 16px', background: '#64748B', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>🚫 Dismiss</button>
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