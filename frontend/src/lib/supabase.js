/**
 * Punto de conexión futuro a Supabase Auth.
 * El acceso actual usa la API REST (tabla `usuarios` + JWT).
 *
 * Cuando se migre:
 *   import { createClient } from '@supabase/supabase-js'
 *   export const supabase = createClient(url, anonKey)
 */
export const supabase = null
