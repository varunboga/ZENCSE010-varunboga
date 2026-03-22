/*
 * US-25 — Paginated Certificate List
 *
 * TODO (Students):
 * 1. On mount, call GET /api/v1/certificates?skip=0&limit=20 with X-API-Key header
 * 2. Render results in a table with columns:
 *    - Certificate ID
 *    - Recipient Name
 *    - Course Title
 *    - Issued Date (format: DD/MM/YYYY)
 *    - Status (colored badge: green=ACTIVE, red=REVOKED)
 *    - Actions (View button)
 *
 * 3. Add Previous / Next pagination buttons
 *    - Track current page offset in state
 *    - Disable Previous on first page, disable Next when results < limit
 *
 * 4. Clicking a row (or the View button) navigates to /certificates/:id
 *
 * API: GET http://localhost:8000/api/v1/certificates?skip=0&limit=20
 * Headers: X-API-Key: <your-api-key>
 *
 * Expected response: array of:
 * {
 *   "certificate_id": "CERT-...",
 *   "recipient_name": "John Doe",
 *   "course_title": "Full Stack Dev",
 *   "issued_at": "2026-03-05T10:00:00Z",
 *   "status": "ACTIVE"
 * }
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { Navbar, styles } from './Dashboard'

const LIMIT = 20

export default function CertificateList() {
  const [certificates, setCertificates] = useState([])
  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    apiClient.get('/certificates/?skip=' + skip + '&limit=' + LIMIT)
      .then((data) => { setCertificates(data); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [skip])

  return (
    <div style={styles.page}>
      <Navbar navigate={navigate} />
      <div style={styles.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={styles.heading}>Certificates</h1>
          <button onClick={() => navigate('/issue')} style={styles.btnPrimary}>+ Issue New</button>
        </div>

        {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}
        {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}

        {!loading && !error && (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Certificate ID', 'Recipient', 'Course', 'Issued', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.certificate_id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px' }}>{cert.certificate_id}</td>
                      <td style={{ padding: '12px 16px' }}>{cert.recipient?.name || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{cert.certificate?.title || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-GB') : '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: cert.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: cert.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }}>
                          {cert.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => navigate('/certificates/' + cert.certificate_id)}
                          style={{ padding: '4px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No certificates found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSkip(Math.max(0, skip - LIMIT))} disabled={skip === 0}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: skip === 0 ? 'not-allowed' : 'pointer', opacity: skip === 0 ? 0.5 : 1 }}>
                Previous
              </button>
              <button onClick={() => setSkip(skip + LIMIT)} disabled={certificates.length < LIMIT}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: certificates.length < LIMIT ? 'not-allowed' : 'pointer', opacity: certificates.length < LIMIT ? 0.5 : 1 }}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
