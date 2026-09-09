from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.models.company import Company
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserOut

router = APIRouter()

@router.get("", response_model=List[UserOut])
@router.get("/", response_model=List[UserOut])
def read_users(
    db: Session = Depends(deps.get_db),
    company_id: Optional[int] = None,
    include_super_admins: bool = False,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Listar usuários:
    - Super Admin: lista todos ou filtra por company_id.
    - Company Admin e Company User: lista APENAS os usuários da própria empresa.
    - include_super_admins=true: inclui SuperAdmins no resultado (para dropdown de técnicos),
      pois SuperAdmins podem receber chamados de qualquer empresa.
    """
    from sqlalchemy import or_

    query = db.query(User)

    if current_user.role == UserRole.SUPER_ADMIN:
        if company_id is not None:
            if include_super_admins:
                # Retorna usuários da empresa + todos os SuperAdmins
                query = query.filter(
                    or_(User.company_id == company_id, User.role == UserRole.SUPER_ADMIN)
                )
            else:
                query = query.filter(User.company_id == company_id)
    else:
        # Company Admin/User: usuários da própria empresa
        query = query.filter(User.company_id == current_user.company_id)
        if include_super_admins:
            # Também inclui SuperAdmins globais como técnicos disponíveis
            query = db.query(User).filter(
                or_(User.company_id == current_user.company_id, User.role == UserRole.SUPER_ADMIN)
            )

    users = query.offset(skip).limit(limit).all()
    return users

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
) -> Any:
    """
    Criar novo usuário:
    - Super Admin: pode criar usuário para qualquer empresa ou super admin global.
    - Company Admin: pode criar usuários APENAS para sua própria empresa (não pode criar Super Admin).
    - Company User: Acesso negado (403).
    """
    # Validação de e-mail existente
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário cadastrado com este e-mail",
        )

    target_company_id = user_in.company_id
    
    # Se o criador for Admin de Empresa
    if current_user.role == UserRole.COMPANY_ADMIN:
        # Força o vínculo à empresa do criador
        target_company_id = current_user.company_id
        # Admin de empresa não pode criar Super Admin
        if user_in.role == UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrador de empresa não pode criar Super Administrador Geral",
            )
    elif current_user.role == UserRole.SUPER_ADMIN:
        # Se for Super Admin criando um usuário não-super admin, valida a empresa
        if user_in.role != UserRole.SUPER_ADMIN and not target_company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empresa é obrigatória para usuários e administradores de empresa",
            )

    if target_company_id:
        company = db.query(Company).filter(Company.id == target_company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa de destino não encontrada",
            )

    user = User(
        company_id=target_company_id,
        full_name=user_in.full_name,
        email=user_in.email.lower().strip(),
        hashed_password=security.get_password_hash(user_in.password),
        role=user_in.role,
        phone=user_in.phone,
        department=user_in.department,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{id}", response_model=UserOut)
def read_user_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Obter detalhes de usuário por ID:
    - Super Admin: qualquer usuário.
    - Company Admin e User: apenas se for da mesma empresa ou se for ele mesmo.
    """
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    
    if current_user.role != UserRole.SUPER_ADMIN and user.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado aos dados deste usuário",
        )
    return user

@router.put("/{id}", response_model=UserOut)
def update_user(
    id: int,
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Atualizar usuário:
    - Super Admin: pode alterar qualquer usuário.
    - Company Admin: pode alterar usuários da sua empresa (não pode alterar Super Admin).
    - Company User: pode alterar SOMENTE o seu próprio cadastro (id == current_user.id).
    """
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Verificação de permissões estrita
    if current_user.role == UserRole.COMPANY_USER:
        if user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuários comuns só têm permissão para atualizar seu próprio perfil",
            )
        # Usuário comum não pode mudar a própria Role, Company ou status ativo
        user_in.role = None
        user_in.company_id = None
        user_in.is_active = None

    elif current_user.role == UserRole.COMPANY_ADMIN:
        if user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: Este usuário pertence a outra empresa",
            )
        if user.role == UserRole.SUPER_ADMIN or user_in.role == UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não é permitido gerenciar contas de Super Administrador",
            )
        # Admin de empresa não pode transferir usuário para outra empresa
        user_in.company_id = None

    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.hashed_password = security.get_password_hash(update_data.pop("password"))
    
    if "email" in update_data and update_data["email"]:
        new_email = update_data["email"].lower().strip()
        existing = db.query(User).filter(User.email == new_email, User.id != id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este e-mail já está sendo utilizado por outro usuário",
            )
        user.email = new_email
        del update_data["email"]

    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
):
    """
    Desativar / Excluir usuário:
    - Super Admin: qualquer usuário (exceto ele próprio se for o único).
    - Company Admin: apenas usuários da própria empresa (exceto ele próprio).
    - Company User: Proibido (403).
    """
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode excluir sua própria conta de administrador",
        )
    if current_user.role == UserRole.COMPANY_ADMIN:
        if user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: Este usuário não pertence à sua empresa",
            )
        if user.role == UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado",
            )

    db.delete(user)
    db.commit()
    return None
