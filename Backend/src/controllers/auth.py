import uuid
from typing import Optional
from fastapi import Request, Response, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.User import Users
from ..schema.auth import (
    AuthRegisterRequest,
    AuthLoginRequest,
    AuthResponse,
    UserResponse,
    TokenResponse,
    MessageResponse,
)
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    set_auth_cookies,
    clear_auth_cookies,
)
from ..db.desp import get_db


async def auth_status():
    """Health check for auth service."""
    return {"status": "OK"}


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[Users]:
    """Retrieve current user from access_token cookie or Authorization header, or None if unauthenticated."""
    token: Optional[str] = request.cookies.get("access_token")

    if not token:
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    try:
        payload = decode_token(token, is_refresh=False)
        user_id_str = payload.get("sub") or payload.get("id") or payload.get("user_id")
        token_type = payload.get("type", "access")
        role = payload.get("role", "customer")
        if not user_id_str or (token_type and token_type != "access"):
            return None
        user_id = uuid.UUID(str(user_id_str))
    except Exception:
        return None

    stmt = select(Users).where(Users.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.isActive:
        return None

    return user


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Users:
    """Enforce authentication and return the current user."""
    user = await get_current_user_optional(request=request, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. You must log in to buy products or place orders.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def register(
    payload: AuthRegisterRequest,
    response: Response,
    db: AsyncSession,
) -> AuthResponse:

    if not payload.email or not payload.name or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All required fields must be provided",
        )

    # Check if user already exists
    stmt = select(Users).where(Users.email == payload.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    if payload.mobile_number:
        m_stmt = select(Users).where(Users.mobile_number == payload.mobile_number)
        m_res = await db.execute(m_stmt)
        if m_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this mobile number already exists",
            )

    # Hash password
    password_hashed = hash_password(payload.password)

    # Create new user
    new_user = Users(
        email=payload.email,
        name=payload.name,
        password_hash=password_hashed,
        mobile_number=payload.mobile_number,
        refresh_token="",
        isVerified=False,
        isActive=True,
    )
    db.add(new_user)
    await db.flush()

    token_payload = {"sub": str(new_user.id), "email": new_user.email}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    # Store refresh token on user
    new_user.refresh_token = refresh_token
    await db.commit()
    await db.refresh(new_user)

    # Set cookies on response
    set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return AuthResponse(
        message="User registered successfully",
        user=UserResponse.model_validate(new_user),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


async def login(
    payload: AuthLoginRequest,
    response: Response,
    db: AsyncSession,
) -> AuthResponse:

    stmt = select(Users).where(Users.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled",
        )

    # Generate tokens
    token_payload = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    # Update refresh token in DB
    user.refresh_token = refresh_token
    await db.commit()
    await db.refresh(user)

    # Set HTTP-only cookies
    set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return AuthResponse(
        message="Login successful",
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


async def logout(
    response: Response,
    db: AsyncSession,
    current_user: Optional[Users] = None,
) -> MessageResponse:
    """Clear cookies and invalidate refresh token in database."""
    if current_user:
        current_user.refresh_token = ""
        await db.commit()

    clear_auth_cookies(response)
    return MessageResponse(message="Successfully logged out")


async def refresh_tokens(
    request: Request,
    response: Response,
    db: AsyncSession,
) -> TokenResponse:
    """Refresh access and refresh tokens using cookie or Authorization header."""
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header.split(" ", 1)[1]

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded = decode_token(refresh_token, is_refresh=True)
        user_id_str = decoded.get("sub")
        token_type = decoded.get("type")
        if not user_id_str or token_type != "refresh":
            raise ValueError()
        user_id = uuid.UUID(user_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(Users).where(Users.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    if user.refresh_token and user.refresh_token != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is no longer valid",
        )

    token_payload = {"sub": str(user.id), "email": user.email}
    new_access_token = create_access_token(token_payload)
    new_refresh_token = create_refresh_token(token_payload)

    user.refresh_token = new_refresh_token
    await db.commit()

    set_auth_cookies(response, access_token=new_access_token, refresh_token=new_refresh_token)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


async def me(current_user: Users) -> UserResponse:
    """Return the profile of the currently logged-in user."""
    return UserResponse.model_validate(current_user)


async def verify(
    current_user: Optional[Users],
    db: AsyncSession,
    payload: Optional[VerifyRequest] = None,
) -> MessageResponse:
    """Verify user account."""
    if current_user:
        current_user.isVerified = True
        await db.commit()
        return MessageResponse(message="User account verified successfully", status="OK")
    return MessageResponse(message="Verification confirmed", status="OK")


# Preserved verification stubs
async def auth(db: AsyncSession):
    return {"status": "OK", "role": "user"}


async def verify_account(db: AsyncSession):
    return {"status": "OK"}


async def verify_email_1(db: AsyncSession):
    return {"status": "OK"}


async def verify_email_2(db: AsyncSession):
    return {"status": "OK"}


async def verify_email_3(db: AsyncSession):
    return {"status": "OK"}

