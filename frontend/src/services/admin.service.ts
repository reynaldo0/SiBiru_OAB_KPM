import { apiRequest } from './api-client';
import type { AdminMetrics, Booking, BookingStatus, Room } from '../types';

export interface AdminBookingsFilter {
  status?: BookingStatus;
  room_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface MasterScheduleItem {
  id: string;
  room_id: string;
  room_name: string;
  user_id: string;
  borrower_name: string;
  organization: string;
  purpose: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

export interface CreateRoomPayload {
  name: string;
  location: string;
  capacity: number;
  is_active?: boolean;
  image_url?: string | null;
  facilities: string[];
}

export interface UpdateRoomPayload {
  name?: string;
  location?: string;
  capacity?: number;
  is_active?: boolean;
  image_url?: string | null;
  facilities?: string[];
}

export const adminService = {
  getMetrics: async (): Promise<AdminMetrics> => {
    return apiRequest<AdminMetrics>('/admin/metrics');
  },

  getBookings: async (filters?: AdminBookingsFilter): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.room_id) params.set('room_id', filters.room_id);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString();
    return apiRequest<Booking[]>(`/admin/bookings${query ? `?${query}` : ''}`);
  },

  updateBookingStatus: async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    rejection_reason?: string
  ): Promise<Booking> => {
    return apiRequest<Booking>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason }),
    });
  },

  getSchedule: async (startDate: string, endDate: string): Promise<MasterScheduleItem[]> => {
    return apiRequest<MasterScheduleItem[]>(
      `/admin/schedule?start_date=${startDate}&end_date=${endDate}`
    );
  },

  createRoom: async (payload: CreateRoomPayload): Promise<Room> => {
    return apiRequest<Room>('/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateRoom: async (id: string, payload: UpdateRoomPayload): Promise<Room> => {
    return apiRequest<Room>(`/admin/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  toggleRoomStatus: async (id: string, is_active: boolean): Promise<Room> => {
    return apiRequest<Room>(`/admin/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  },
};
