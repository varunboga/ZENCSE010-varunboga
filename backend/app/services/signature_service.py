import json, base64, hashlib, os
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
from app.config import settings

def _canonicalize(data: dict) -> bytes:
    return json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")

def sign_certificate(data: dict) -> tuple[str, str]:
    canonical_bytes = _canonicalize(data)
    data_hash = f"sha256:{hashlib.sha256(canonical_bytes).hexdigest()}"
    with open(settings.private_key_path, "rb") as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None)
    signature_b64 = base64.b64encode(private_key.sign(canonical_bytes, ec.ECDSA(hashes.SHA256()))).decode()
    return signature_b64, data_hash

def verify_certificate(data: dict, signature_b64: str) -> bool:
    try:
        canonical_bytes = _canonicalize(data)
        with open(settings.public_key_path, "rb") as f:
            public_key = serialization.load_pem_public_key(f.read())
        public_key.verify(base64.b64decode(signature_b64), canonical_bytes, ec.ECDSA(hashes.SHA256()))
        return True
    except (InvalidSignature, ValueError, TypeError):
        return False

def generate_keys():
    os.makedirs("keys", exist_ok=True)
    private_key = ec.generate_private_key(ec.SECP256R1())
    with open("keys/private_key.pem", "wb") as f:
        f.write(private_key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    with open("keys/public_key.pem", "wb") as f:
        f.write(private_key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo))
    print("ECDSA P-256 key pair generated successfully!")
