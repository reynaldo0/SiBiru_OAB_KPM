export type UserRole = 'BORROWER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  identifier: string; // NIM atau NIP
  role: UserRole;
  organization: string;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
  image_url?: string | null;
  facilities: string[];
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BookedInterval {
  booking_id: string;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  status: BookingStatus;
  organization: string;
  borrower_name: string;
}

export interface RoomAvailability {
  room_id: string;
  room_name: string;
  date: string;
  is_room_active: boolean;
  booked_intervals: BookedInterval[];
}

export interface Booking {
  id: string;
  room_id: string;
  room_name?: string | null;
  room_location?: string | null;
  user_id: string;
  borrower_name: string;
  organization: string;
  purpose: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export type MasterScheduleItem = Booking;

export interface ConflictDetail {
  error: string;
  message: string;
  conflict_details: {
    conflicting_booking_id?: string;
    existing_status?: BookingStatus;
    existing_organization?: string;
    existing_start_time?: string;
    existing_end_time?: string;
    date?: string;
  };
}

export interface AdminMetrics {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_bookings: number;
  total_rooms: number;
  active_rooms: number;
  today_bookings_count: number;
}

export interface RegisterPayload {
  name: string;
  identifier: string;
  role: UserRole;
  organization: string;
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}
