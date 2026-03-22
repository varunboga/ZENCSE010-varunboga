from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "certshield"

    # API Key (admin endpoint protection)
    api_key: str = "change-me"

    # Verification portal base URL embedded inside QR code
    # e.g. http://localhost:3001/v  → final URL: http://localhost:3001/v/{cert_id}
    verify_base_url: str = "http://localhost:3001/v"

    # Institution info shown on verification page
    institution_name: str = "CertShield Institution"

    # ECDSA key file paths
    private_key_path: str = "keys/private_key.pem"
    public_key_path: str = "keys/public_key.pem"
    key_id: str = "key-2026-01"

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Single shared instance — import this everywhere
settings = Settings()
