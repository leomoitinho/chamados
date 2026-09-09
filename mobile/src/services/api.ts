import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, Category, User, TicketStatus, TicketPriority } from '../types';

// Endereço IP do servidor Backend para o app mobile
// Para testes em emulador Android: 'http://10.0.2.2:8000/api/v1'
// Para aparelho físico / Wi-Fi: 'http://IP_DO_SEU_PC:8000/api/v1'
export const BASE_URL = 'http://10.0.2.2:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@deskmaster:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Erro ao ler token no AsyncStorage:', e);
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const ticketService = {
  list: async (params?: { status?: TicketStatus; search?: string }): Promise<Ticket[]> => {
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
    priority: TicketPriority;
    category_id?: number;
  }): Promise<Ticket> => {
    const response = await api.post('/tickets', data);
    return response.data;
  },
  updateStatus: async (id: number, status: TicketStatus, comment?: string): Promise<Ticket> => {
    const response = await api.patch(`/tickets/${id}/status`, { status, comment });
    return response.data;
  },
  addComment: async (ticketId: number, message: string, isInternal = false) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, { message, is_internal: isInternal });
    return response.data;
  }
};

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  }
};
