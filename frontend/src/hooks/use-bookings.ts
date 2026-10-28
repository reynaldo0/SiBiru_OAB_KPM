import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsService, type CreateBookingPayload } from '../services/bookings.service';
import type { BookingStatus } from '../types';
import { roomKeys } from './use-rooms';

export const bookingKeys = {
  my: (status?: BookingStatus) => ['bookings', 'my', status] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export function useMyBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: bookingKeys.my(status),
    queryFn: () => bookingsService.getMyBookings(status),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsService.createBooking(payload),
    onSuccess: (newBooking) => {
      // Invalidate room availability and user's bookings
      queryClient.invalidateQueries({
        queryKey: roomKeys.availability(newBooking.room_id, newBooking.booking_date),
      });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}
