import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
import jwt
from fastapi import Response
from ..config.settngs import settings


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, is_refresh: bool = False) -> Dict[str, Any]:
    print("decoding....")
    secret_key = settings.JWT_REFRESH_SECRET_KEY if is_refresh else settings.JWT_SECRET_KEY
    # try:
    #     deocded = jwt.decode(token, secret_key, algorithms=[settings.JWT_ALGORITHM])
    #     print("result: ", jwt.decode(token, secret_key, algorithms=[settings.JWT_ALGORITHM]))
    # except Exception as e:
    #     print("error: ", e)
    return jwt.decode(token, secret_key, algorithms=[settings.JWT_ALGORITHM])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=access_max_age,
        expires=access_max_age,
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=refresh_max_age,
        expires=refresh_max_age,
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear access and refresh token cookies from the response."""
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


def set_seller_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HTTP-only cookies for seller access and refresh tokens on the response."""
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="seller_access_token",
        value=access_token,
        max_age=access_max_age,
        expires=access_max_age,
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    response.set_cookie(
        key="seller_refresh_token",
        value=refresh_token,
        max_age=refresh_max_age,
        expires=refresh_max_age,
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


def clear_seller_auth_cookies(response: Response) -> None:
    """Clear seller access and refresh token cookies from the response."""
    response.delete_cookie(
        key="seller_access_token",
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    response.delete_cookie(
        key="seller_refresh_token",
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
