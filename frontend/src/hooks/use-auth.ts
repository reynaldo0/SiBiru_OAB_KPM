import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import type { LoginPayload, RegisterPayload } from '../types';

export function useCurrentUserQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => authService.getMe(),
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Bridges the persisted token with the current user profile.
 * Clears the session automatically when a stored token is no longer valid.
 */
export function useAuthSession() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clearSession = useAuthStore((state) => state.clearSession);

  const query = useCurrentUserQuery();

  useEffect(() => {
    if (!token) {
      if (authStatus !== 'unauthenticated') setStatus('unauthenticated');
      return;
    }

    if (query.isError) {
      clearSession();
      return;
    }

    if (query.data) {
      setUser(query.data);
      return;
    }

    if (query.isLoading) setStatus('loading');
  }, [
    token,
    query.data,
    query.isError,
    query.isLoading,
    authStatus,
    setUser,
    setStatus,
    clearSession,
  ]);

  return {
    token,
    user,
    authStatus,
    isAuthenticated: authStatus === 'authenticated' && Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isBootstrapping: Boolean(token) && (authStatus === 'idle' || authStatus === 'loading'),
  };
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginPayload | string) => {
      const payload: LoginPayload =
        typeof credentials === 'string' ? { identifier: credentials } : credentials;
      return authService.login(payload);
    },
    onSuccess: (response) => {
      queryClient.clear();
      queryClient.setQueryData(['auth', 'me', response.token], response.user);
      setSession(response.token, response.user);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (response) => {
      queryClient.clear();
      queryClient.setQueryData(['auth', 'me', response.token], response.user);
      setSession(response.token, response.user);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.clear();
    clearSession();
  }, [clearSession, queryClient]);
}
