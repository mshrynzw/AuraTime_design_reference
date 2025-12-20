import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'employee' | 'manager' | 'admin' | 'system_admin';

export interface UserProfile {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  employee_id: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
}

export interface TimeEntry {
  id: string;
  company_id: string;
  user_id: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

export interface DailyAttendance {
  id: string;
  company_id: string;
  user_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_work_minutes: number;
  total_break_minutes: number;
  overtime_minutes: number;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  is_approved: boolean;
}

export interface LeaveRequest {
  id: string;
  company_id: string;
  user_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
}
