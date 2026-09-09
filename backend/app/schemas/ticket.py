from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.ticket import TicketStatus, TicketPriority
from app.schemas.company import CompanySimpleOut
from app.schemas.user import UserSimpleOut
from app.schemas.category import CategoryOut
from app.schemas.comment import CommentOut

class TicketBase(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    category_id: Optional[int] = None

class TicketCreate(TicketBase):
    company_id: Optional[int] = None # Se omitido, atribui a empresa do usuário logado
    assigned_to_id: Optional[int] = None

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TicketPriority] = None
    category_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    status: Optional[TicketStatus] = None

class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    comment: Optional[str] = None

class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    code: str
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    company_id: int
    company: Optional[CompanySimpleOut] = None
    category_id: Optional[int] = None
    category: Optional[CategoryOut] = None
    creator_id: int
    creator: Optional[UserSimpleOut] = None
    assigned_to_id: Optional[int] = None
    assigned_to: Optional[UserSimpleOut] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    comments_count: Optional[int] = 0

class TicketDetailOut(TicketOut):
    comments: List[CommentOut] = []
