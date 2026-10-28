import { apiRequest } from './api-client';
import type { Room, RoomAvailability } from '../types';

export interface GetRoomsParams {
  is_active_only?: boolean;
  min_capacity?: number;
  search?: string;
}

export const roomsService = {
  getRooms: async (params?: GetRoomsParams): Promise<Room[]> => {
    const searchParams = new URLSearchParams();
    if (params?.is_active_only !== undefined) {
      searchParams.set('is_active_only', String(params.is_active_only));
    }
    if (params?.min_capacity !== undefined) {
      searchParams.set('min_capacity', String(params.min_capacity));
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }

    const query = searchParams.toString();
    const endpoint = `/rooms${query ? `?${query}` : ''}`;
    return apiRequest<Room[]>(endpoint);
  },

  getRoomDetail: async (id: string): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}`);
  },

  getRoomAvailability: async (id: string, date: string): Promise<RoomAvailability> => {
    return apiRequest<RoomAvailability>(`/rooms/${id}/availability?date=${date}`);
  },
};
