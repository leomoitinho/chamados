from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CompanyBase(BaseModel):
    name: str
    cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class CompanySimpleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    cnpj: Optional[str] = None

class CompanyOut(CompanyBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
    users_count: Optional[int] = 0
    tickets_count: Optional[int] = 0
