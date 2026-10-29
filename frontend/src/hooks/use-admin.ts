import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  type AdminBookingsFilter,
  type CreateRoomPayload,
  type UpdateRoomPayload,
} from '../services/admin.service';
import { useAuthStore } from '../store/auth.store';

export const adminKeys = {
  metrics: (userId: string | null) => ['admin', 'metrics', userId ?? 'anonymous'] as const,
  bookings: (userId: string | null, filters?: AdminBookingsFilter) =>
    ['admin', 'bookings', userId ?? 'anonymous', filters ?? {}] as const,
  schedule: (userId: string | null, startDate: string, endDate: string) =>
    ['admin', 'schedule', userId ?? 'anonymous', startDate, endDate] as const,
};

export function useAdminMetrics() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: adminKeys.metrics(userId ?? null),
    queryFn: () => adminService.getMetrics(),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchInterval: 3000,
  });
}

export function useAdminBookings(filters?: AdminBookingsFilter, options?: { enabled?: boolean }) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: adminKeys.bookings(userId ?? null, filters),
    queryFn: () => adminService.getBookings(filters),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    staleTime: 0,
    refetchInterval: 3000,
  });
}

export function useMasterSchedule(startDate: string, endDate: string) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: adminKeys.schedule(userId ?? null, startDate, endDate),
    queryFn: () => adminService.getSchedule(startDate, endDate),
    enabled: Boolean(userId && startDate && endDate),
    staleTime: 0,
    refetchInterval: 4000,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejection_reason,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      rejection_reason?: string;
    }) => adminService.updateBookingStatus(id, status, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useToggleRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminService.toggleRoomStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => adminService.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
      adminService.updateRoom(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
