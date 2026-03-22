/*
 * US-26 — Certificate Detail Page with Revoke Action
 *
 * TODO (Students):
 * 1. Read certificate ID from URL params: useParams()
 * 2. On mount, call GET /api/v1/certificates/:id with X-API-Key header
 * 3. Display all certificate fields:
 *    - Recipient name, email, student ID
 *    - Course title, description, skills (as tags)
 *    - Issue date, expiry date
 *    - Status badge
 *    - Verification count and last verified at
 * 4. Show QR code image: <img src={`data:image/png;base64,...`} />
 *    (Hint: call GET /api/v1/certificates/:id/qrcode to get the PNG,
 *     or render from the certificate data if you store base64)
 * 5. Add a "Download QR" button
 *
 * 6. Revoke button (only shown when status === "ACTIVE"):
 *    - Show a confirmation dialog: "Are you sure you want to revoke this certificate?"
 *    - On confirm, call PUT /api/v1/certificates/:id/revoke
 *    - On success, refresh the certificate data (status will change to REVOKED)
 *    - Hide the Revoke button after revocation
 *
 * API:
 *   GET  http://localhost:8000/api/v1/certificates/:id   (headers: X-API-Key)
 *   PUT  http://localhost:8000/api/v1/certificates/:id/revoke   (headers: X-API-Key)
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { Navbar, styles } from './Dashboard'

export default function CertificateDetail() {
  const { id } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revoking, setRevoking] = useState(false)
  const navigate = useNavigate()

  const fetchCert = () => {
    apiClient.get('/certificates/' + id)
      .then((data) => { setCert(data); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchCert() }, [id])

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return
    setRevoking(true)
    try {
      await apiClient.put('/certificates/' + id + '/revoke', { reason: 'Revoked by admin', revoked_by: 'admin' })
      fetchCert()
    } catch (err) {
      alert('Revoke failed: ' + err.message)
    }
    setRevoking(false)
  }

 const downloadQR = async () => {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL + '/certificates/' + id + '/qrcode',
      { headers: { 'X-API-Key': import.meta.env.VITE_API_KEY } }
    )
    if (!response.ok) throw new Error('Failed to fetch QR code')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = id + '-qrcode.png'
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to download QR: ' + err.message)
  }
}

  if (loading) return <div style={styles.page}><Navbar navigate={navigate} /><div style={styles.content}><p>Loading...</p></div></div>
  if (error) return <div style={styles.page}><Navbar navigate={navigate} /><div style={styles.content}><p style={{ color: '#dc2626' }}>{error}</p></div></div>

  const isActive = cert.status === 'ACTIVE'

  return (
    <div style={styles.page}>
      <Navbar navigate={navigate} />
      <div style={styles.content}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => navigate('/certificates')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
          <h1 style={{ ...styles.heading, margin: 0 }}>Certificate Detail</h1>
          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#16a34a' : '#dc2626' }}>{cert.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Recipient</h2>
            <Field label="Name" value={cert.recipient?.name} />
            <Field label="Email" value={cert.recipient?.email} />
            <Field label="Student ID" value={cert.recipient?.student_id} />
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Certificate</h2>
            <Field label="Title" value={cert.certificate?.title} />
            <Field label="Description" value={cert.certificate?.description} />
            <Field label="Issued" value={cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
            <Field label="Expires" value={cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : 'Never'} />
            <Field label="Verifications" value={cert.verification_count} />
            {cert.certificate?.skills?.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Skills: </span>
                {cert.certificate.skills.map(s => (
                  <span key={s} style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', margin: '2px' }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {isActive && (
            <button onClick={handleRevoke} disabled={revoking}
              style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              {revoking ? 'Revoking...' : 'Revoke Certificate'}
            </button>
          )}
          <button onClick={downloadQR}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Download QR
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: '500' }}>{value || '-'}</span>
    </div>
  )
}
