from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserOut, UserProfileUpdate

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    login_data: LoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Login endpoint padrão para JSON Body (React / Mobile).
    """
    email = login_data.email
    password = login_data.password

    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user or not security.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo no sistema. Contate o administrador.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        subject=user.id,
        role=user.role.value,
        company_id=user.company_id,
        expires_delta=access_token_expires
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Login endpoint compatível com Form Data do Swagger UI (/docs).
    """
    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo no sistema",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        subject=user.id,
        role=user.role.value,
        company_id=user.company_id,
        expires_delta=access_token_expires
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_current_user(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retorna os dados do usuário autenticado no momento.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_current_user_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Permite ao próprio usuário atualizar seus dados de perfil (nome, telefone, departamento e senha).
    """
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.department is not None:
        current_user.department = profile_in.department
    if profile_in.password:
        current_user.hashed_password = security.get_password_hash(profile_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user
