import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xkpxgsspvdsqvdavirtf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcHhnc3NwdmRzcXZkYXZpcnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDY3OTcsImV4cCI6MjA5NDEyMjc5N30._IEJpdAuxM4HXrsfEIz7kLg8zvRQh0J4sTN0agnVtFY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function storageGet(key) {
  const { data } = await supabase
    .from('wc2026_store')
    .select('value')
    .eq('key', key)
    .single()
  return data ? { value: data.value } : null
}

export async function storageSet(key, value) {
  await supabase
    .from('wc2026_store')
    .upsert({ key, value, updated_at: new Date().toISOString() })
}

export async function storageDelete(key) {
  await supabase
    .from('wc2026_store')
    .delete()
    .eq('key', key)
}
