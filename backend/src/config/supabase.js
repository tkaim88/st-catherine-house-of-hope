import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'

dotenv.config()

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
)

export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'media'