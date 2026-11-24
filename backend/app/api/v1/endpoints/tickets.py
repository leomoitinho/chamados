from datetime import datetime
import random
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_

from app.api import deps
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.comment import TicketComment
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketStatusUpdate, TicketOut, TicketDetailOut

router = APIRouter()

def generate_ticket_code(db: Session) -> str:
    """Gera código único para o chamado, ex: TKT-2026-0001"""
    year = datetime.utcnow().year
    count = db.query(func.count(Ticket.id)).scalar() or 0
    return f"TKT-{year}-{(count + 1):04d}"

@router.get("", response_model=List[TicketOut])
@router.get("/", response_model=List[TicketOut])
def read_tickets(
    db: Session = Depends(deps.get_db),
    company_id: Optional[int] = None,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    category_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    creator_id: Optional[int] = None,
    my_tickets: Optional[bool] = False,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Listar chamados com filtros avançados:
    - Super Admin: lista chamados globais ou por empresa selecionada.
    - Company Admin e Company User: visualiza chamados da sua própria empresa.
    - my_tickets=True: filtra chamados onde o usuário logado é o solicitante OU o técnico responsável.
    """
    query = db.query(Ticket)

    # Multi-tenant scoping
    if current_user.role == UserRole.SUPER_ADMIN:
        if company_id is not None:
            query = query.filter(Ticket.company_id == company_id)
    else:
        query = query.filter(Ticket.company_id == current_user.company_id)

    # Optional Filters
    if my_tickets:
        query = query.filter(
            or_(
                Ticket.creator_id == current_user.id,
                Ticket.assigned_to_id == current_user.id
            )
        )
    if status is not None:
        query = query.filter(Ticket.status == status)
    if priority is not None:
        query = query.filter(Ticket.priority == priority)
    if category_id is not None:
        query = query.filter(Ticket.category_id == category_id)
    if assigned_to_id is not None:
        query = query.filter(Ticket.assigned_to_id == assigned_to_id)
    if creator_id is not None:
        query = query.filter(Ticket.creator_id == creator_id)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(search_term),
                Ticket.code.ilike(search_term),
                Ticket.description.ilike(search_term)
            )
        )

    tickets = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()
    
    # Enrich with comment counts
    for t in tickets:
        t.comments_count = len(t.comments)
    return tickets

@router.post("", response_model=TicketDetailOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TicketDetailOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Criar novo chamado:
    - Usuário Comum / Admin de Empresa: vinculado automaticamente à sua empresa.
    - Super Admin: pode definir a empresa de destino.
    """
    target_company_id = current_user.company_id
    if current_user.role == UserRole.SUPER_ADMIN:
        if not ticket_in.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Super Admin deve especificar a empresa do chamado",
            )
        target_company_id = ticket_in.company_id
    
    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empresa não identificada para este usuário",
        )

    # Validar se a empresa existe
    company = db.query(Company).filter(Company.id == target_company_id).first()
    if not company or not company.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empresa inválida ou inativa",
        )

    # Validar assigned_to se fornecido
    # Super Admins podem receber chamados de qualquer empresa (company_id deles é NULL)
    if ticket_in.assigned_to_id:
        assignee = db.query(User).filter(User.id == ticket_in.assigned_to_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Técnico atribuído não encontrado",
            )
        # Permite SuperAdmins como técnicos em qualquer chamado
        is_super_admin_assignee = assignee.role == UserRole.SUPER_ADMIN
        if not is_super_admin_assignee and (current_user.role != UserRole.SUPER_ADMIN and assignee.company_id != target_company_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Técnico atribuído não pertence à empresa do chamado",
            )

    code = generate_ticket_code(db)
    
    ticket = Ticket(
        code=code,
        company_id=target_company_id,
        category_id=ticket_in.category_id,
        creator_id=current_user.id,
        assigned_to_id=ticket_in.assigned_to_id,
        title=ticket_in.title,
        description=ticket_in.description,
        priority=ticket_in.priority,
        status=TicketStatus.OPEN
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Criar primeiro registro de timeline
    initial_comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=f"Chamado aberto com status Aberto e prioridade {ticket.priority.value}.",
        is_internal=False
    )
    db.add(initial_comment)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/{id}", response_model=TicketDetailOut)
def read_ticket_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Obter detalhes completos do chamado com timeline de mensagens.
    """
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
        
    deps.enforce_tenant_isolation(current_user, ticket.company_id)
    return ticket

@router.put("/{id}", response_model=TicketDetailOut)
def update_ticket(
    id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Atualizar chamado (título, descrição, prioridade, técnico atribuído, categoria).
    """
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")

    deps.enforce_tenant_isolation(current_user, ticket.company_id)
    
    # Se for usuário comum, só pode editar se for o criador e se estiver aberto
    if current_user.role == UserRole.COMPANY_USER:
        if ticket.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Você só pode editar chamados criados por você")
        if ticket.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            raise HTTPException(status_code=400, detail="Chamados resolvidos ou fechados não podem ser alterados")

    update_data = ticket_in.model_dump(exclude_unset=True)
    
    # Validar assigned_to
    # Super Admins podem atribuir qualquer usuário (ou a si mesmos)
    if "assigned_to_id" in update_data:
        if update_data["assigned_to_id"] is not None:
            assignee = db.query(User).filter(User.id == update_data["assigned_to_id"]).first()
            if not assignee:
                raise HTTPException(status_code=400, detail="Técnico atribuído não encontrado")
            is_super_admin_assignee = assignee.role == UserRole.SUPER_ADMIN
            if not is_super_admin_assignee and (current_user.role != UserRole.SUPER_ADMIN and assignee.company_id != ticket.company_id):
                raise HTTPException(status_code=400, detail="Técnico atribuído não pertence à empresa do chamado")
            ticket.assigned_to_id = update_data["assigned_to_id"]
        else:
            ticket.assigned_to_id = None

    for field, value in update_data.items():
        if field != "assigned_to_id":
            setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)
    return ticket

@router.patch("/{id}/status", response_model=TicketDetailOut)
def update_ticket_status(
    id: int,
    status_in: TicketStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Alterar status do chamado (ex: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).
    Registra automaticamente a mudança na timeline.
    """
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")

    deps.enforce_tenant_isolation(current_user, ticket.company_id)

    old_status = ticket.status
    new_status = status_in.status
    ticket.status = new_status

    if new_status == TicketStatus.RESOLVED and not ticket.resolved_at:
        ticket.resolved_at = datetime.utcnow()
    elif new_status == TicketStatus.CLOSED and not ticket.closed_at:
        ticket.closed_at = datetime.utcnow()

    # Comentário de status
    msg = f"Status alterado de '{old_status.value}' para '{new_status.value}' por {current_user.full_name}."
    if status_in.comment:
        msg += f"\nObservação: {status_in.comment}"

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=msg,
        is_internal=False
    )
    db.add(comment)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_company_admin_or_super)
):
    """
    Excluir chamado (Super Admin ou Company Admin).
    """
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    deps.enforce_tenant_isolation(current_user, ticket.company_id)

    db.delete(ticket)
    db.commit()
    return None
