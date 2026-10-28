import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    retry: false,
  });
}

export function useDemoUsers() {
  return useQuery({
    queryKey: ['auth', 'demo-users'],
    queryFn: () => authService.getDemoUsers(),
  });
}
