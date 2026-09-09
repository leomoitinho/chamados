from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.ticket import Ticket
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut

router = APIRouter()

@router.get("", response_model=List[CompanyOut])
@router.get("/", response_model=List[CompanyOut])
def read_companies(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Lista empresas. Super Admin vê todas; outros veem apenas a sua empresa.
    """
    query = db.query(Company)
    if current_user.role != UserRole.SUPER_ADMIN:
        query = query.filter(Company.id == current_user.company_id)

    companies = query.offset(skip).limit(limit).all()
    
    # Enrich with counts
    result = []
    for comp in companies:
        users_count = db.query(func.count(User.id)).filter(User.company_id == comp.id).scalar() or 0
        tickets_count = db.query(func.count(Ticket.id)).filter(Ticket.company_id == comp.id).scalar() or 0
        
        comp_dict = {
            "id": comp.id,
            "name": comp.name,
            "cnpj": comp.cnpj,
            "email": comp.email,
            "phone": comp.phone,
            "is_active": comp.is_active,
            "created_at": comp.created_at,
            "updated_at": comp.updated_at,
            "users_count": users_count,
            "tickets_count": tickets_count
        }
        result.append(comp_dict)
    return result

@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(
    company_in: CompanyCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
) -> Any:
    """
    Criar nova empresa (Exclusivo Super Administrador Geral).
    """
    if company_in.cnpj:
        existing = db.query(Company).filter(Company.cnpj == company_in.cnpj).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma empresa cadastrada com este CNPJ",
            )
    
    company = Company(
        name=company_in.name,
        cnpj=company_in.cnpj,
        email=company_in.email,
        phone=company_in.phone,
        is_active=company_in.is_active
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/{id}", response_model=CompanyOut)
def read_company_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Obter detalhes de uma empresa por ID.
    """
    deps.enforce_tenant_isolation(current_user, id)
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada",
        )
    users_count = db.query(func.count(User.id)).filter(User.company_id == company.id).scalar() or 0
    tickets_count = db.query(func.count(Ticket.id)).filter(Ticket.company_id == company.id).scalar() or 0
    return {
        "id": company.id,
        "name": company.name,
        "cnpj": company.cnpj,
        "email": company.email,
        "phone": company.phone,
        "is_active": company.is_active,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "users_count": users_count,
        "tickets_count": tickets_count
    }

@router.put("/{id}", response_model=CompanyOut)
def update_company(
    id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
) -> Any:
    """
    Atualizar empresa (Super Admin ou Company Admin da própria empresa).
    """
    deps.enforce_tenant_isolation(current_user, id)
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada",
        )
    
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """
    Excluir ou desativar empresa (Exclusivo Super Admin).
    """
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada",
        )
    db.delete(company)
    db.commit()
    return None
