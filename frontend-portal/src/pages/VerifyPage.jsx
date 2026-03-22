/*
 * US-20 — Manual Certificate ID Verification Page
 *
 * TODO (Students):
 * 1. Render a centered page with:
 *    - CertShield logo / heading
 *    - A text input labeled "Enter Certificate ID"
 *    - A "Verify" button
 *
 * 2. On submit:
 *    - Show a loading spinner
 *    - Call GET /api/v1/verify/:certificateId (NO auth header — public endpoint)
 *    - Navigate to /v/:certificateId OR render VerificationResult inline
 *
 * 3. Works on mobile browsers (responsive layout)
 *
 * API: GET http://localhost:8000/api/v1/verify/:certificateId
 * No authentication required.
 *
 * Hint:
 *   import { useNavigate } from 'react-router-dom'
 *   const navigate = useNavigate()
 *   navigate(`/v/${certificateId}`)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleVerify = () => {
    if (!certificateId.trim()) return
    setLoading(true)
    navigate(`/v/${certificateId.trim()}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'sans-serif',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
          CertShield
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Verify the authenticity of a digital certificate
        </p>

        <input
          type="text"
          placeholder="Enter Certificate ID (e.g. CERT-550e8400...)"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            marginBottom: '16px',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading || !certificateId.trim()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: certificateId.trim() ? 'pointer' : 'not-allowed',
            opacity: certificateId.trim() ? 1 : 0.6,
          }}
        >
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
      </div>
    </div>
  )
}