import pytest
import base64
from app.services.signature_service import sign_certificate, verify_certificate
from app.services.qr_service import generate_qr_base64


# TC-4.3.1 — Signature round-trip
def test_signature_round_trip():
    data = {"name": "John", "course": "Python"}
    sig, hash_ = sign_certificate(data)
    assert verify_certificate(data, sig) is True


# TC-4.3.2 — Signature tamper detect
def test_signature_tamper_detect():
    data = {"name": "John", "course": "Python"}
    sig, _ = sign_certificate(data)
    data["name"] = "Hacker"
    assert verify_certificate(data, sig) is False


# TC-4.3.3 — Wrong key verify
def test_wrong_signature():
    data_a = {"name": "Alice"}
    data_b = {"name": "Bob"}
    sig_b, _ = sign_certificate(data_b)
    assert verify_certificate(data_a, sig_b) is False


# TC-4.3.4 — QR generates valid base64 PNG
def test_qr_valid_base64_png():
    url = "http://localhost:3001/v/CERT-test-123"
    qr_b64 = generate_qr_base64(url)
    raw = base64.b64decode(qr_b64)
    assert raw[:4] == b'\x89PNG', "Not a valid PNG"


# TC-4.3.5 — QR content matches URL
def test_qr_different_urls():
    qr1 = generate_qr_base64("http://localhost:3001/v/CERT-aaa")
    qr2 = generate_qr_base64("http://localhost:3001/v/CERT-bbb")
    assert qr1 != qr2


# TC-1.2.3 — Data hash format
def test_data_hash_format():
    data = {"name": "Test"}
    _, hash_ = sign_certificate(data)
    assert hash_.startswith("sha256:")


# TC-1.2.4 — Deterministic hash
def test_deterministic_hash():
    data = {"name": "Test", "course": "Python"}
    _, hash1 = sign_certificate(data)
    _, hash2 = sign_certificate(data)
    assert hash1 == hash2


# TC-1.2.9 — Verify invalid base64
def test_verify_invalid_base64():
    data = {"name": "Test"}
    assert verify_certificate(data, "not-valid-base64!!!") is False


# TC-1.2.10 — Canonical ordering
def test_canonical_ordering():
    data1 = {"b": 2, "a": 1}
    data2 = {"a": 1, "b": 2}
    _, hash1 = sign_certificate(data1)
    _, hash2 = sign_certificate(data2)
    assert hash1 == hash2