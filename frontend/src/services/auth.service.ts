import { apiRequest } from './api-client';
import type { User, DemoUser } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  login: async (identifier: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },

  getDemoUsers: async (): Promise<DemoUser[]> => {
    return apiRequest<DemoUser[]>('/auth/demo-users');
  },
};
