import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mosdrjlkafkzeklnvxxj.supabase.co'
const supabaseAnonKey = 'sb_publishable_K4Rpos0eF3AYGrSBOOdwUw_q0PrJCcp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)