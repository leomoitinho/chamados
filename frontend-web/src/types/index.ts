export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';

export interface CompanySimple {
  id: number;
  name: string;
  cnpj?: string;
}

export interface Company {
  id: number;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count?: number;
  tickets_count?: number;
}

export interface User {
  id: number;
  company_id?: number | null;
  company?: CompanySimple | null;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Category {
  id: number;
  company_id?: number | null;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
  };
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface Ticket {
  id: number;
  code: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  company_id: number;
  company?: CompanySimple;
  category_id?: number;
  category?: Category;
  creator_id: number;
  creator?: {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
  };
  assigned_to_id?: number;
  assigned_to?: {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
  };
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  comments_count?: number;
  comments?: Comment[];
}

export interface DashboardMetrics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  urgent_tickets: number;
  assigned_to_me_count?: number;
  overdue_sla_count?: number;
  critical_pending_count?: number;
  total_companies?: number;
  total_users?: number;
  by_status: { status: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  companies_summary?: {
    company_id: number;
    company_name: string;
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
  }[];
}
