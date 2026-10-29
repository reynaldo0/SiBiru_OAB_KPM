import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsService, type CreateBookingPayload } from '../services/bookings.service';
import { useAuthStore } from '../store/auth.store';
import type { BookingStatus } from '../types';

export const bookingKeys = {
  my: (userId: string | null, status?: BookingStatus) =>
    ['bookings', 'my', userId ?? 'anonymous', status ?? 'ALL'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export function useMyBookings(status?: BookingStatus) {
  const userId = useAuthStore((state) => state.user?.id ?? state.token);

  return useQuery({
    queryKey: bookingKeys.my(userId, status),
    queryFn: () => bookingsService.getMyBookings(status),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchInterval: 3000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
