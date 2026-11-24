from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.schemas.dashboard import DashboardMetricsOut, StatusCount, PriorityCount, CompanyTicketStats

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetricsOut)
def read_dashboard_metrics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retorna métricas consolidadas para os cards e gráficos do Dashboard.
    """
    ticket_query = db.query(Ticket)
    user_query = db.query(User)
    
    if current_user.role != UserRole.SUPER_ADMIN:
        ticket_query = ticket_query.filter(Ticket.company_id == current_user.company_id)
        user_query = user_query.filter(User.company_id == current_user.company_id)

    total_tickets = ticket_query.count()
    open_tickets = ticket_query.filter(Ticket.status == TicketStatus.OPEN).count()
    in_progress_tickets = ticket_query.filter(Ticket.status == TicketStatus.IN_PROGRESS).count()
    pending_tickets = ticket_query.filter(Ticket.status == TicketStatus.PENDING).count()
    resolved_tickets = ticket_query.filter(Ticket.status == TicketStatus.RESOLVED).count()
    closed_tickets = ticket_query.filter(Ticket.status == TicketStatus.CLOSED).count()
    urgent_tickets = ticket_query.filter(Ticket.priority == TicketPriority.URGENT).count()

    # Chamados atribuídos especificamente ao usuário logado (abertos ou em andamento)
    assigned_to_me_count = db.query(Ticket).filter(
        Ticket.assigned_to_id == current_user.id,
        Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.PENDING])
    ).count()

    # Cálculo de SLA estourado / Atrasados:
    # URGENT: > 4 horas | HIGH: > 24 horas | MEDIUM: > 48 horas | LOW: > 72 horas
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    active_tickets = ticket_query.filter(
        Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
    ).all()

    overdue_sla_count = 0
    critical_pending_count = 0
    sla_limits = {
        TicketPriority.URGENT: timedelta(hours=4),
        TicketPriority.HIGH: timedelta(hours=24),
        TicketPriority.MEDIUM: timedelta(hours=48),
        TicketPriority.LOW: timedelta(hours=72),
    }

    for t in active_tickets:
        limit = sla_limits.get(t.priority, timedelta(hours=48))
        if (now - t.created_at) > limit:
            overdue_sla_count += 1
            if t.priority in [TicketPriority.URGENT, TicketPriority.HIGH]:
                critical_pending_count += 1

    # By Status
    by_status = [
        StatusCount(status=TicketStatus.OPEN.value, count=open_tickets),
        StatusCount(status=TicketStatus.IN_PROGRESS.value, count=in_progress_tickets),
        StatusCount(status=TicketStatus.PENDING.value, count=pending_tickets),
        StatusCount(status=TicketStatus.RESOLVED.value, count=resolved_tickets),
        StatusCount(status=TicketStatus.CLOSED.value, count=closed_tickets),
    ]

    # By Priority
    by_priority = [
        PriorityCount(priority=TicketPriority.LOW.value, count=ticket_query.filter(Ticket.priority == TicketPriority.LOW).count()),
        PriorityCount(priority=TicketPriority.MEDIUM.value, count=ticket_query.filter(Ticket.priority == TicketPriority.MEDIUM).count()),
        PriorityCount(priority=TicketPriority.HIGH.value, count=ticket_query.filter(Ticket.priority == TicketPriority.HIGH).count()),
        PriorityCount(priority=TicketPriority.URGENT.value, count=urgent_tickets),
    ]

    total_companies = None
    companies_summary = None
    
    if current_user.role == UserRole.SUPER_ADMIN:
        total_companies = db.query(Company).filter(Company.is_active == True).count()
        total_users = db.query(User).filter(User.is_active == True).count()
        
        # Summary per company
        companies = db.query(Company).filter(Company.is_active == True).limit(10).all()
        companies_summary = []
        for c in companies:
            c_tickets = db.query(Ticket).filter(Ticket.company_id == c.id)
            companies_summary.append(
                CompanyTicketStats(
                    company_id=c.id,
                    company_name=c.name,
                    total_tickets=c_tickets.count(),
                    open_tickets=c_tickets.filter(Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])).count(),
                    resolved_tickets=c_tickets.filter(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])).count()
                )
            )
    else:
        total_users = user_query.filter(User.is_active == True).count()

    return DashboardMetricsOut(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        pending_tickets=pending_tickets,
        resolved_tickets=resolved_tickets,
        closed_tickets=closed_tickets,
        urgent_tickets=urgent_tickets,
        assigned_to_me_count=assigned_to_me_count,
        overdue_sla_count=overdue_sla_count,
        critical_pending_count=critical_pending_count,
        total_companies=total_companies,
        total_users=total_users,
        by_status=by_status,
        by_priority=by_priority,
        companies_summary=companies_summary
    )
