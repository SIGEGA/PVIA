require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Cliente Supabase con clave de servicio para operaciones del backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
