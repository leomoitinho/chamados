from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api import deps
from app.models.category import Category
from app.models.user import User, UserRole
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter()

@router.get("", response_model=List[CategoryOut])
@router.get("/", response_model=List[CategoryOut])
def read_categories(
    db: Session = Depends(deps.get_db),
    company_id: Optional[int] = None,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Listar categorias. Retorna categorias globais e específicas da empresa do usuário.
    """
    query = db.query(Category).filter(Category.is_active == True)
    
    if current_user.role == UserRole.SUPER_ADMIN:
        if company_id is not None:
            query = query.filter(or_(Category.company_id == company_id, Category.company_id == None))
    else:
        query = query.filter(or_(Category.company_id == current_user.company_id, Category.company_id == None))

    return query.all()

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
) -> Any:
    """
    Criar categoria (Company Admin ou Super Admin).
    """
    target_company_id = category_in.company_id
    if current_user.role == UserRole.COMPANY_ADMIN:
        target_company_id = current_user.company_id

    category = Category(
        name=category_in.name,
        description=category_in.description,
        color=category_in.color or "#3B82F6",
        company_id=target_company_id,
        is_active=category_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{id}", response_model=CategoryOut)
def update_category(
    id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
) -> Any:
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
    if current_user.role != UserRole.SUPER_ADMIN and category.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Acesso negado a esta categoria")

    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    if current_user.role != UserRole.SUPER_ADMIN and category.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Acesso negado a esta categoria")

    db.delete(category)
    db.commit()
    return None
