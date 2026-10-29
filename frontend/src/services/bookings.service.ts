import { buildQuery } from '../lib/utils';
import { apiRequest } from './api-client';
import type { Booking, BookingStatus } from '../types';

export interface CreateBookingPayload {
  room_id: string;
  organization: string;
  purpose: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export const bookingsService = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMyBookings: async (status?: BookingStatus): Promise<Booking[]> => {
    return apiRequest<Booking[]>(`/bookings/my${buildQuery({ status })}`);
  },

  getBookingDetail: async (id: string): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`);
  },
};
