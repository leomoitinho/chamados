from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserSimpleOut

class CommentCreate(BaseModel):
    message: str
    is_internal: bool = False

class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    ticket_id: int
    user_id: int
    user: Optional[UserSimpleOut] = None
    message: str
    is_internal: bool
    created_at: datetime
