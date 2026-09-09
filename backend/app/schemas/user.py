from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole
from app.schemas.company import CompanySimpleOut

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.COMPANY_USER
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    company_id: Optional[int] = None # Se omitido por COMPANY_ADMIN, será associado à sua própria empresa

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    company_id: Optional[int] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None

class UserSimpleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    full_name: str
    email: EmailStr
    role: UserRole

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_id: Optional[int] = None
    company: Optional[CompanySimpleOut] = None
    created_at: datetime
    updated_at: datetime
