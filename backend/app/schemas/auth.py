from typing import Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Forward reference resolution
from app.schemas.user import UserOut
Token.model_rebuild()
