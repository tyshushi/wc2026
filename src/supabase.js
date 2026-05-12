import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xkpxgsspvdsqvdavirtf.supabase.co'
const SUPABASE_ANON_KEY = 'paste_your_anon_key_here'

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