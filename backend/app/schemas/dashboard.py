from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StatusCount(BaseModel):
    status: str
    count: int

class PriorityCount(BaseModel):
    priority: str
    count: int

class CompanyTicketStats(BaseModel):
    company_id: int
    company_name: str
    total_tickets: int
    open_tickets: int
    resolved_tickets: int

class DashboardMetricsOut(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    pending_tickets: int
    resolved_tickets: int
    closed_tickets: int
    urgent_tickets: int
    total_companies: Optional[int] = None
    total_users: Optional[int] = None
    by_status: List[StatusCount]
    by_priority: List[PriorityCount]
    companies_summary: Optional[List[CompanyTicketStats]] = None
