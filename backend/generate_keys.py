"""
ECDSA P-256 Key Pair Generator — US-04

Run this ONCE before starting the application:
    python generate_keys.py

TODO (Students):
  Implement the key generation logic:

  1. Create the keys/ directory if it doesn't exist (os.makedirs)

  2. If private_key.pem already exists, ask for confirmation before overwriting
     (overwriting invalidates all previously signed certificates)

  3. Generate an ECDSA P-256 private key:
       from cryptography.hazmat.primitives.asymmetric import ec
       private_key = ec.generate_private_key(ec.SECP256R1())

  4. Derive the public key:
       public_key = private_key.public_key()

  5. Save private_key.pem to keys/ in PEM + PKCS8 format (NoEncryption)
     Hint:
       from cryptography.hazmat.primitives import serialization
       private_key.private_bytes(
           encoding=serialization.Encoding.PEM,
           format=serialization.PrivateFormat.PKCS8,
           encryption_algorithm=serialization.NoEncryption(),
       )

  6. Save public_key.pem to keys/ in PEM + SubjectPublicKeyInfo format

  7. Print confirmation messages

  Note: keys/private_key.pem is already in .gitignore — never commit it.
"""

# TODO: implement key generation here
import os
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate_keys():
    os.makedirs("keys", exist_ok=True)

    if os.path.exists("keys/private_key.pem"):
        answer = input("keys/private_key.pem already exists. Overwrite? This invalidates all signed certificates. (yes/no): ")
        if answer.strip().lower() != "yes":
            print("Aborted. Keys not overwritten.")
            return

    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    with open("keys/private_key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    with open("keys/public_key.pem", "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ))

    print("ECDSA P-256 key pair generated successfully!")
    print("Private key: keys/private_key.pem")
    print("Public key:  keys/public_key.pem")

if __name__ == "__main__":
    generate_keys()