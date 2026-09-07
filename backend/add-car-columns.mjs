import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const sql = `
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS fuel_type text,
ADD COLUMN IF NOT EXISTS drivetrain text,
ADD COLUMN IF NOT EXISTS acceleration numeric(4,2),
ADD COLUMN IF NOT EXISTS top_speed int,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
`;

const { data, error } = await supabase.rpc('exec_sql', { sql });
if (error) {
  console.error(error);
  process.exit(1);
}
console.log('Columns added', data);
