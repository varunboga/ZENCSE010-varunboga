/*
 * US-24 — Issue Certificate Form
 *
 * TODO (Students):
 * 1. Build a form with these fields:
 *    - Recipient Name (required text input)
 *    - Recipient Email (required email input)
 *    - Student ID (optional text input)
 *    - Course Title (required text input)
 *    - Description (optional textarea)
 *    - Skills (dynamic list — add/remove tags)
 *    - Issue Date (required date picker)
 *    - Expiry Date (optional date picker)
 *
 * 2. On submit, call POST /api/v1/certificates with X-API-Key header
 *    Request body:
 *    {
 *      "recipient_name": "John Doe",
 *      "recipient_email": "john@example.com",
 *      "recipient_student_id": "STU-001",
 *      "course_title": "Full Stack Development",
 *      "description": "Completed 6-month program",
 *      "skills": ["Python", "React", "MongoDB"],
 *      "issue_date": "2026-03-05",
 *      "expiry_date": null
 *    }
 *
 * 3. On success (HTTP 201):
 *    - Show the QR code image (decode qr_code_base64 and render as <img>)
 *    - Show the certificate_id
 *    - Show a "Download QR" button
 *
 * 4. On HTTP 422: show inline validation errors under each field
 * 5. On other errors: show a general error message
 *
 * Hint for rendering QR:
 *   <img src={`data:image/png;base64,${response.qr_code_base64}`} alt="QR Code" />
 *
 * Hint for Download QR button:
 *   Create a link element with href=data:image/png;base64,... and trigger click
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { Navbar, styles } from './Dashboard'

export default function IssueCertificate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    recipient_name: '', recipient_email: '', recipient_student_id: '',
    course_title: '', description: '', skills: [], issue_date: '', expiry_date: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      set('skills', [...form.skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const body = {
        recipient: {
          name: form.recipient_name,
          email: form.recipient_email,
          student_id: form.recipient_student_id || 'N/A',
        },
        certificate: {
          title: form.course_title,
          description: form.description || null,
          skills: form.skills,
        },
        expires_at: form.expiry_date || null,
      }
      const data = await apiClient.post('/certificates/', body)
      setResult(data)
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Validation error: ' + JSON.stringify(err.response.data.details))
      } else {
        setError(err.message || 'Failed to issue certificate')
      }
    }
    setLoading(false)
  }

  const downloadQR = () => {
    if (!result?.qr_code_base64) return
    const link = document.createElement('a')
    link.href = 'data:image/png;base64,' + result.qr_code_base64
    link.download = result.certificate_id + '-qrcode.png'
    link.click()
  }

  if (result) {
    return (
      <div style={styles.page}>
        <Navbar navigate={navigate} />
        <div style={styles.content}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', maxWidth: '500px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: '#16a34a', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', marginBottom: '12px' }}>ISSUED</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Certificate Issued Successfully</h2>
              <p style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'monospace' }}>{result.certificate_id}</p>
            </div>
            {result.qr_code_base64 && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={'data:image/png;base64,' + result.qr_code_base64} alt="QR Code" style={{ width: '200px', height: '200px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={downloadQR} style={styles.btnPrimary}>Download QR</button>
              <button onClick={() => setResult(null)} style={styles.btnSecondary}>Issue Another</button>
              <button onClick={() => navigate('/certificates')} style={styles.btnSecondary}>View All</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Navbar navigate={navigate} />
      <div style={styles.content}>
        <h1 style={styles.heading}>Issue Certificate</h1>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', maxWidth: '600px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          <Section title="Recipient">
            <Input label="Full Name *" value={form.recipient_name} onChange={v => set('recipient_name', v)} placeholder="John Doe" />
            <Input label="Email *" value={form.recipient_email} onChange={v => set('recipient_email', v)} placeholder="john@example.com" type="email" />
            <Input label="Student ID" value={form.recipient_student_id} onChange={v => set('recipient_student_id', v)} placeholder="STU-001" />
          </Section>

          <Section title="Certificate">
            <Input label="Course Title *" value={form.course_title} onChange={v => set('course_title', v)} placeholder="Full Stack Development" />
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Course description..." style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Skills</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add skill..." style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                <button onClick={addSkill} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.skills.map(s => (
                  <span key={s} style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                    {s} x
                  </span>
                ))}
              </div>
            </div>
            <Input label="Issue Date *" value={form.issue_date} onChange={v => set('issue_date', v)} type="date" />
            <Input label="Expiry Date" value={form.expiry_date} onChange={v => set('expiry_date', v)} type="date" />
          </Section>

          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading || !form.recipient_name || !form.recipient_email || !form.course_title}
            style={{ ...styles.btnPrimary, opacity: (!form.recipient_name || !form.recipient_email || !form.course_title) ? 0.6 : 1 }}>
            {loading ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>{title}</h3>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle} />
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }
