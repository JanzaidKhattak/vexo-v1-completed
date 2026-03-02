'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const REPORT_REASONS = [
  'Fraud / Scam',
  'Wrong category',
  'Duplicate ad',
  'Inappropriate content',
  'Fake price',
  'Already sold',
  'Other',
]

export default function ReportAdModal({ adId, adTitle }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason')
      return
    }
    setLoading(true)
    try {
      // TODO: API call
      await new Promise(r => setTimeout(r, 800))
      setSubmitted(true)
      toast.success('Report submitted. Thank you!')
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setReason('')
        setDetails('')
      }, 2000)
    } catch {
      toast.error('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontFamily: 'DM Sans, sans-serif',
          cursor: 'pointer',
          padding: '8px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Flag size={14} /> Report Ad
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Report this Ad"
        size="sm"
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '18px',
              marginBottom: '8px',
            }}>Report Submitted!</h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
            }}>Hamari team 24 ghante mein review karegi.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
              background: 'var(--bg-secondary)',
              padding: '10px 14px',
              borderRadius: '10px',
              margin: 0,
            }}>
              📋 <strong style={{ color: 'var(--text-primary)' }}>{adTitle}</strong>
            </p>

            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontFamily: 'DM Sans, sans-serif',
                display: 'block',
                marginBottom: '8px',
              }}>
                Reason <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1.5px solid ${reason === r ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                      background: reason === r ? 'var(--brand-light)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      color: reason === r ? 'var(--brand-primary)' : 'var(--text-primary)',
                      fontWeight: reason === r ? '600' : '400',
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${reason === r ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {reason === r && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--brand-primary)',
                        }} />
                      )}
                    </div>
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontFamily: 'DM Sans, sans-serif',
                display: 'block',
                marginBottom: '8px',
              }}>Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Koi aur information jo helpful ho..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-default)',
                  outline: 'none',
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-default)',
                  background: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading || !reason ? '#FCA5A5' : 'var(--danger)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: loading || !reason ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '⏳ Submitting...' : '🚩 Submit Report'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}