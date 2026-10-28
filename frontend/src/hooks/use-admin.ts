import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  type AdminBookingsFilter,
  type CreateRoomPayload,
  type UpdateRoomPayload,
} from '../services/admin.service';

export const adminKeys = {
  metrics: ['admin', 'metrics'] as const,
  bookings: (filters?: AdminBookingsFilter) => ['admin', 'bookings', filters] as const,
  schedule: (startDate: string, endDate: string) => ['admin', 'schedule', startDate, endDate] as const,
};

export function useAdminMetrics() {
  return useQuery({
    queryKey: adminKeys.metrics,
    queryFn: () => adminService.getMetrics(),
  });
}

export function useAdminBookings(filters?: AdminBookingsFilter) {
  return useQuery({
    queryKey: adminKeys.bookings(filters),
    queryFn: () => adminService.getBookings(filters),
  });
}

export function useMasterSchedule(startDate: string, endDate: string) {
  return useQuery({
    queryKey: adminKeys.schedule(startDate, endDate),
    queryFn: () => adminService.getSchedule(startDate, endDate),
    enabled: Boolean(startDate && endDate),
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedule'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => adminService.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}
