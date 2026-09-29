from typing import Optional
from fastapi import APIRouter, Request, Response, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.auth import (
    AuthRegisterRequest,
    AuthLoginRequest,
    AuthResponse,
    UserResponse,
    TokenResponse,
    MessageResponse,
    VerifyRequest,
)
from ..controllers import auth
from ..models.User import Users
from ..db.desp import get_db

router = APIRouter(tags=["AUTH USER"])


@router.get("/", status_code=status.HTTP_200_OK)
async def auth_root(db: AsyncSession = Depends(get_db)):
    """Health check / root for user authentication."""
    return await auth.auth(db)


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
async def register_user(
    payload: AuthRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await auth.register(payload=payload, response=response, db=db)


@router.post("/login", status_code=status.HTTP_200_OK, response_model=AuthResponse)
async def login_user(
    payload: AuthLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await auth.login(payload=payload, response=response, db=db)


@router.post("/logout", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def logout_user(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Users] = Depends(auth.get_current_user_optional),
):
    return await auth.logout(response=response, db=db, current_user=current_user)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_user_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await auth.refresh_tokens(request=request, response=response, db=db)


@router.get("/me", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_current_user_profile(
    current_user: Users = Depends(auth.get_current_user),
):
    return await auth.me(current_user=current_user)


@router.post("/verify", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.get("/verify", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def verify_user(
    payload: Optional[VerifyRequest] = None,
    current_user: Optional[Users] = Depends(auth.get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Verify user account."""
    return await auth.verify(current_user=current_user, db=db, payload=payload)
