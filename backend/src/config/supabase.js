const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios');
}

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase };
