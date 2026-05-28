import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sslmozbifqqooeviombu.supabase.co';
const supabaseKey = 'sb_publishable_Cnou-hz3mTSOt6EBI7LHiA_VVoRfpV0';

export const supabase = createClient(supabaseUrl, supabaseKey);
