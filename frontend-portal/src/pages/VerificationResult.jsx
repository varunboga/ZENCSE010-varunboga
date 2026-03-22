import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import apiClient from "../api/client"

export default function VerificationResult() {
  const { certificateId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiClient.get("/api/v1/verify/" + certificateId)
      .then((data) => { setResult(data); setLoading(false) })
      .catch(() => { setResult({ result: "NOT_FOUND", certificate_id: certificateId, message: "Certificate not found." }); setLoading(false) })
  }, [certificateId])

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>Verifying certificate...</p>
      </div>
    )
  }

  const isValid = result.result === "VALID"
  const isRevoked = result.result === "REVOKED"
  const cardColor = isValid ? "#f0fdf4" : isRevoked ? "#fff7ed" : "#fef2f2"
  const borderColor = isValid ? "#86efac" : isRevoked ? "#fdba74" : "#fca5a5"
  const iconColor = isValid ? "#16a34a" : isRevoked ? "#ea580c" : "#dc2626"
  const iconText = isValid ? "VALID" : isRevoked ? "REVOKED" : "INVALID"
  const title = isValid ? "Certificate is Authentic" : isRevoked ? "This Certificate Has Been Revoked" : result.result === "TAMPERED" ? "Certificate Data Has Been Tampered" : "Certificate Not Found"
  const issuedDate = result.issued_at ? new Date(result.issued_at) : null
  const recipientName = result.recipient_name || (result.recipient && result.recipient.name)
  const courseTitle = result.course_title || (result.certificate && result.certificate.title)
  const linkedInUrl = isValid && issuedDate ? "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=" + encodeURIComponent(courseTitle || "") + "&organizationName=" + encodeURIComponent(result.institution_name || "CertShield") + "&issueYear=" + issuedDate.getFullYear() + "&issueMonth=" + (issuedDate.getMonth() + 1) + "&certUrl=" + encodeURIComponent(window.location.href) + "&certId=" + encodeURIComponent(certificateId) : null

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb" }}>CertShield</div>
        </div>
        <div style={{ backgroundColor: cardColor, border: "1px solid " + borderColor, borderRadius: "12px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "white", backgroundColor: iconColor, display: "inline-block", padding: "6px 16px", borderRadius: "20px", marginBottom: "12px" }}>{iconText}</div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: iconColor, margin: "0" }}>{title}</h2>
          </div>
          {isValid && (
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
              <Row label="Recipient" value={recipientName} />
              <Row label="Course" value={courseTitle} />
              <Row label="Issued By" value={result.institution_name || "CertShield Institution"} />
              <Row label="Issued On" value={issuedDate ? issuedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"} />
              {result.expires_at && <Row label="Expires" value={new Date(result.expires_at).toLocaleDateString()} />}
              <Row label="Certificate ID" value={certificateId} mono />
            </div>
          )}
          {!isValid && (
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>{result.message || "Result: " + result.result}</p>
              <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>Certificate ID: {certificateId}</p>
            </div>
          )}
          {isValid && linkedInUrl && (
            <div style={{ marginBottom: "12px" }}>
              <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "12px", backgroundColor: "#0077b5", color: "white", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontWeight: "600", fontSize: "15px", boxSizing: "border-box" }}>Add to LinkedIn Profile</a>
            </div>
          )}
          <button onClick={() => navigate("/verify")} style={{ display: "block", width: "100%", padding: "12px", backgroundColor: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "14px", boxSizing: "border-box" }}>Verify Another Certificate</button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ color: "#6b7280", fontSize: "13px", minWidth: "100px" }}>{label}</span>
      <span style={{ color: "#1f2937", fontSize: "13px", fontWeight: "500", textAlign: "right", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{value || "-"}</span>
    </div>
  )
}
