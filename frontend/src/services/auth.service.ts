import { apiRequest } from './api-client';
import type { User, DemoUser, LoginPayload, RegisterPayload, LoginResponse } from '../types';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },

  getDemoUsers: async (): Promise<DemoUser[]> => {
    return apiRequest<DemoUser[]>('/auth/demo-users');
  },
};
