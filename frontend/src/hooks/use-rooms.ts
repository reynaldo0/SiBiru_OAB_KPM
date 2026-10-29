import { useQuery } from '@tanstack/react-query';
import { roomsService, type GetRoomsParams } from '../services/rooms.service';

export const roomKeys = {
  all: (params?: GetRoomsParams) => ['rooms', 'list', params ?? {}] as const,
  detail: (id: string) => ['rooms', 'detail', id] as const,
  availability: (id: string, date: string) => ['rooms', 'availability', id, date] as const,
};

export function useRooms(params?: GetRoomsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roomKeys.all(params),
    queryFn: () => roomsService.getRooms(params),
    enabled: options?.enabled ?? true,
    staleTime: 3000,
    refetchInterval: 5000,
  });
}

export function useRoomDetail(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsService.getRoomDetail(id),
    enabled: Boolean(id),
    staleTime: 3000,
    retry: false,
  });
}

export function useRoomAvailability(id: string, date: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roomKeys.availability(id, date),
    queryFn: () => roomsService.getRoomAvailability(id, date),
    enabled: (options?.enabled ?? true) && Boolean(id && date),
    staleTime: 0,
    refetchInterval: 3000,
  });
}
