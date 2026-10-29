import { buildQuery } from '../lib/utils';
import { apiRequest } from './api-client';
import type { Room, RoomAvailability } from '../types';

export interface GetRoomsParams {
  is_active_only?: boolean;
  min_capacity?: number;
  search?: string;
}

export const roomsService = {
  getRooms: async (params?: GetRoomsParams): Promise<Room[]> => {
    const query = buildQuery({
      is_active_only: params?.is_active_only,
      min_capacity: params?.min_capacity,
      search: params?.search,
    });
    return apiRequest<Room[]>(`/rooms${query}`);
  },

  getRoomDetail: async (id: string): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}`);
  },

  getRoomAvailability: async (id: string, date: string): Promise<RoomAvailability> => {
    return apiRequest<RoomAvailability>(`/rooms/${id}/availability${buildQuery({ date })}`);
  },
};
