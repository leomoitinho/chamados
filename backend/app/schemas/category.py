from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#3B82F6"
    is_active: bool = True

class CategoryCreate(CategoryBase):
    company_id: Optional[int] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_id: Optional[int] = None
    created_at: datetime
