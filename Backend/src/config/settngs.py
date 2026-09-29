from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn

    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    VERSION:str = 'v1'

    JWT_SECRET_KEY: str = "semantic-ecommerce-jwt-secret-key-change-in-production"
    JWT_REFRESH_SECRET_KEY: str = "semantic-ecommerce-jwt-refresh-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 240
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_HTTPONLY: bool = True

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""

    EMBEDDING_MODEL_NAME: str = "BAAI/bge-base-en-v1.5"
    HF_TOKEN: str = ""

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()