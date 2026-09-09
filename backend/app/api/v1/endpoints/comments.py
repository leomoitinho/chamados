from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api import deps
from app.models.ticket import Ticket
from app.models.comment import TicketComment
from app.schemas.comment import CommentCreate, CommentOut
from app.models.user import User

router = APIRouter()

@router.get("/tickets/{ticket_id}/comments", response_model=List[CommentOut])
def read_ticket_comments(
    ticket_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Listar mensagens / comentários da timeline de um chamado.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
        
    deps.enforce_tenant_isolation(current_user, ticket.company_id)
    return ticket.comments

@router.post("/tickets/{ticket_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_ticket_comment(
    ticket_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Adicionar nova mensagem / resposta ao chamado.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")

    deps.enforce_tenant_isolation(current_user, ticket.company_id)

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=comment_in.message,
        is_internal=comment_in.is_internal
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
