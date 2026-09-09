import axios from 'axios';
import { Company, User, Ticket, Comment, Category, DashboardMetrics, TicketStatus, TicketPriority } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateMe: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  }
};

// Companies Services
export const companyService = {
  list: async (skip = 0, limit = 100): Promise<Company[]> => {
    const response = await api.get('/companies', { params: { skip, limit } });
    return response.data;
  },
  getById: async (id: number): Promise<Company> => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
  create: async (data: Partial<Company>): Promise<Company> => {
    const response = await api.post('/companies', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`);
  }
};

// Users Services
export const userService = {
  list: async (company_id?: number, include_super_admins = false): Promise<User[]> => {
    const response = await api.get('/users', { params: { company_id, include_super_admins } });
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: number, data: any): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

// Tickets Services
export const ticketService = {
  list: async (params?: {
    company_id?: number;
    status?: TicketStatus;
    priority?: TicketPriority;
    category_id?: number;
    assigned_to_id?: number;
    creator_id?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<Ticket[]> => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },
  getById: async (id: number): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  create: async (data: {
    title: string;
    description: string;
    priority?: TicketPriority;
    category_id?: number;
    company_id?: number;
    assigned_to_id?: number;
  }): Promise<Ticket> => {
    const response = await api.post('/tickets', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, status: TicketStatus, comment?: string): Promise<Ticket> => {
    const response = await api.patch(`/tickets/${id}/status`, { status, comment });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },
  addComment: async (ticket_id: number, message: string, is_internal = false): Promise<Comment> => {
    const response = await api.post(`/tickets/${ticket_id}/comments`, { message, is_internal });
    return response.data;
  }
};

// Categories Services
export const categoryService = {
  list: async (company_id?: number): Promise<Category[]> => {
    const response = await api.get('/categories', { params: { company_id } });
    return response.data;
  },
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};

// Dashboard Services
export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }
};
