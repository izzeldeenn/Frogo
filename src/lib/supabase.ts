import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DatabaseDevice {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  study_time: number;
  created_at: string;
  last_active: string;
  device_info: any;
}
