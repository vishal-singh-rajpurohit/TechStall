import uuid
from pydantic import BaseModel, EmailStr, model_validator, Field
from typing import Optional
from datetime import datetime


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthRegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    conform_password: str
    mobile_number: Optional[str] = None

    @model_validator(mode="after")
    def verify_passwords_match(self):
        if self.password != self.conform_password:
            raise ValueError("passwords do not match")
        return self


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    mobile_number: Optional[str] = None
    isVerified: bool
    isActive: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    message: str
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class VerifyRequest(BaseModel):
    token: Optional[str] = None
    code: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
    status: str = "OK"