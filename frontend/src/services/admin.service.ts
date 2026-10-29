import { buildQuery } from '../lib/utils';
import { apiRequest } from './api-client';
import type {
  AdminMetrics,
  Booking,
  BookingStatus,
  MasterScheduleItem,
  Room,
} from '../types';

export interface AdminBookingsFilter {
  status?: BookingStatus;
  room_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
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
    const query = buildQuery({
      status: filters?.status,
      room_id: filters?.room_id,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
      search: filters?.search,
    });
    return apiRequest<Booking[]>(`/admin/bookings${query}`);
  },

  updateBookingStatus: async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    rejection_reason?: string,
  ): Promise<Booking> => {
    return apiRequest<Booking>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason }),
    });
  },

  getSchedule: async (
    startDate: string,
    endDate: string,
    roomId?: string,
    status?: BookingStatus,
  ): Promise<MasterScheduleItem[]> => {
    const query = buildQuery({
      start_date: startDate,
      end_date: endDate,
      room_id: roomId,
      status,
    });
    return apiRequest<MasterScheduleItem[]>(`/admin/schedule${query}`);
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

  deleteRoom: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};
