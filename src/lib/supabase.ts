import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Mission {
  id: number;
  person1: string;
  person2: string;
  mission1: string;
  mission2: string;
  created_at: string;
  is_viewed: boolean;
}
