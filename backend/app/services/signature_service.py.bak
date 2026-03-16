"""
ECDSA P-256 Digital Signature Service.

TODO (Students):
  Implement two functions:

  1. sign_certificate(data: dict) -> tuple[str, str]
     - Canonicalize the dict: sort keys, convert to JSON string
     - Compute SHA-256 hash of the canonical string
     - Load private key from settings.private_key_path (PEM format)
     - Sign the hash using ECDSA with SHA-256 (from `cryptography` library)
     - Return (base64-encoded signature, hex data_hash)

     Hint:
       from cryptography.hazmat.primitives.asymmetric import ec
       from cryptography.hazmat.primitives import hashes, serialization
       private_key.sign(data_bytes, ec.ECDSA(hashes.SHA256()))

  2. verify_certificate(data: dict, signature_b64: str) -> bool
     - Canonicalize + hash the data the same way as sign_certificate
     - Load public key from settings.public_key_path
     - Decode the base64 signature
     - Verify using the public key
     - Return True if valid, False if verification fails

     Hint: Use try/except around public_key.verify(...)
           It raises InvalidSignature if verification fails.

  Also provide:
  3. generate_keys() — a utility to generate a new ECDSA P-256 key pair
     and save private_key.pem + public_key.pem to the keys/ folder.
     Run this ONCE to set up the system.
"""

# TODO: implement SignatureService here
