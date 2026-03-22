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
  const [qrUrl, setQrUrl] = useState(null)
  const navigate = useNavigate()

  const fetchCert = async () => {
    try {
      const data = await apiClient.get('/certificates/' + id)
      setCert(data)
      setLoading(false)
      // Fetch QR code as blob URL
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/v1/certificates/' + id + '/qrcode',
        { headers: { 'X-API-Key': import.meta.env.VITE_API_KEY } }
      )
      if (response.ok) {
        const blob = await response.blob()
        setQrUrl(URL.createObjectURL(blob))
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => { fetchCert() }, [id])

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return
    setRevoking(true)
    try {
      await apiClient.put('/certificates/' + id + '/revoke', { reason: 'Revoked by admin', revoked_by: 'admin' })
      await fetchCert()
    } catch (err) {
      alert('Revoke failed: ' + err.message)
    }
    setRevoking(false)
  }

  const downloadQR = async () => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + '/api/v1/certificates/' + id + '/qrcode',
      { headers: { 'X-API-Key': import.meta.env.VITE_API_KEY } }
    )
    if (!response.ok) { alert('Failed to download QR'); return }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = id + '-qrcode.png'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div style={styles.page}><Navbar navigate={navigate} /><div style={styles.content}><p>Loading...</p></div></div>
  if (error) return <div style={styles.page}><Navbar navigate={navigate} /><div style={styles.content}><p style={{ color: '#dc2626' }}>{error}</p></div></div>
  if (!cert) return <div style={styles.page}><Navbar navigate={navigate} /><div style={styles.content}><p>Certificate not found.</p></div></div>

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
            <Field label="Last Verified" value={cert.last_verified_at ? new Date(cert.last_verified_at).toLocaleString() : 'Never'} />
            <Field label="Signature Hash" value={cert.signature?.data_hash} mono />
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

        {/* Revocation info */}
        {!isActive && cert.revocation && (
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', padding: '20px', marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#ea580c' }}>Revocation Details</h2>
            <Field label="Revoked At" value={cert.revocation.revokedAt ? new Date(cert.revocation.revokedAt).toLocaleString() : '-'} />
            <Field label="Reason" value={cert.revocation.reason} />
            <Field label="Revoked By" value={cert.revocation.revokedBy} />
          </div>
        )}

        {/* QR Code */}
        {qrUrl && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginTop: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>QR Code</h2>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
          </div>
        )}

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

function Field({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#1f2937', fontSize: '13px', fontWeight: '500', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', maxWidth: '60%', textAlign: 'right' }}>{value || '-'}</span>
    </div>
  )
}