// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xyqbpulpepfplzdfayrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cWJwdWxwZXBmcGx6ZGZheXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzMzNjEsImV4cCI6MjA2MDA0OTM2MX0.cTv3fD4Dx7ea01XEbtbaUZunUw9UIq_LTmuU8ViOkog";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);