/*
 * US-23 — Admin Dashboard Stats Page
 *
 * TODO (Students):
 * 1. On component mount, call GET /api/v1/stats with X-API-Key header
 * 2. Display 4 stat cards:
 *    - Total Issued
 *    - Active
 *    - Revoked
 *    - Verifications Today
 * 3. Auto-refresh every 30 seconds (use setInterval + clearInterval in useEffect)
 * 4. Show a loading spinner while fetching
 * 5. Show error message if API call fails
 *
 * API: GET http://localhost:8000/api/v1/stats
 * Headers: X-API-Key: <your-api-key>
 *
 * Expected response:
 * {
 *   "total": 42,
 *   "active": 38,
 *   "revoked": 4,
 *   "verifications_today": 12
 * }
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchStats = () => {
    apiClient.get('/stats/')
      .then((data) => { setStats(data); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const cards = stats ? [
    { label: 'Total Issued', value: stats.total, color: '#2563eb' },
    { label: 'Active', value: stats.active, color: '#16a34a' },
    { label: 'Revoked', value: stats.revoked, color: '#dc2626' },
    { label: 'Verifications Today', value: stats.verifications_today, color: '#9333ea' },
  ] : []

  return (
    <div style={styles.page}>
      <Navbar navigate={navigate} />
      <div style={styles.content}>
        <h1 style={styles.heading}>Dashboard</h1>
        {loading && <p style={{ color: '#6b7280' }}>Loading stats...</p>}
        {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
        {stats && (
          <div style={styles.grid}>
            {cards.map((card) => (
              <div key={card.label} style={{ ...styles.card, borderTop: '4px solid ' + card.color }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                <div style={{ color: '#6b7280', marginTop: '8px' }}>{card.label}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/issue')} style={styles.btnPrimary}>Issue Certificate</button>
          <button onClick={() => navigate('/certificates')} style={styles.btnSecondary}>View All Certificates</button>
        </div>
      </div>
    </div>
  )
}

export function Navbar({ navigate }) {
  return (
    <div style={{ backgroundColor: '#1e3a5f', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '24px', height: '56px' }}>
      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginRight: '16px' }}>CertShield Admin</div>
      <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>Dashboard</button>
      <button onClick={() => navigate('/issue')} style={styles.navBtn}>Issue</button>
      <button onClick={() => navigate('/certificates')} style={styles.navBtn}>Certificates</button>
    </div>
  )
}

export const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  content: { padding: '32px' },
  heading: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  card: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  btnPrimary: { padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { padding: '10px 20px', backgroundColor: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  navBtn: { background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '14px', padding: '4px 8px' },
}