import { useQuery } from '@tanstack/react-query';
import { roomsService, type GetRoomsParams } from '../services/rooms.service';

export const roomKeys = {
  all: (params?: GetRoomsParams) => ['rooms', params] as const,
  detail: (id: string) => ['rooms', 'detail', id] as const,
  availability: (id: string, date: string) => ['rooms', 'availability', id, date] as const,
};

export function useRooms(params?: GetRoomsParams) {
  return useQuery({
    queryKey: roomKeys.all(params),
    queryFn: () => roomsService.getRooms(params),
  });
}

export function useRoomDetail(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsService.getRoomDetail(id),
    enabled: Boolean(id),
  });
}

export function useRoomAvailability(id: string, date: string) {
  return useQuery({
    queryKey: roomKeys.availability(id, date),
    queryFn: () => roomsService.getRoomAvailability(id, date),
    enabled: Boolean(id && date),
  });
}
