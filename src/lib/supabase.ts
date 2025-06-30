
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://dodwbvlltnkgwvcrltab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZHdidmxsdG5rZ3d2Y3JsdGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTAyOTksImV4cCI6MjA2Njg2NjI5OX0.V5dGA2DspmfDWZjIa_xbgP09Hc5rz71pULIumLdYMgM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];