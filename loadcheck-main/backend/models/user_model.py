from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from enum import Enum
from .enums import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    company_name: Optional[str] = None
    role: UserRole = UserRole.TRANSPORTER

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    phone: Optional[str] = None
