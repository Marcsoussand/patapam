import { supabase } from './supabase'
import type { FlagCountry, FlagPanel } from '../types/flags'

export const STARTER_FLAG_PANEL_ID = 'starter_20'

export async function loadFlagPanel(panelId: string): Promise<FlagPanel | null> {
  const { data: panel, error: panelError } = await supabase
    .from('flag_panels')
    .select('id, name_fr, name_en, name_he, choice_count')
    .eq('id', panelId)
    .eq('is_active', true)
    .single()

  if (panelError || !panel) {
    console.error('loadFlagPanel', panelError)
    return null
  }

  const { data: links, error: linksError } = await supabase
    .from('flag_panel_countries')
    .select('sort_order, flag_countries ( id, name_fr, name_en, name_he, storage_path, audio_path_fr, audio_path_en, audio_path_he )')
    .eq('panel_id', panelId)
    .order('sort_order')

  if (linksError || !links) {
    console.error('loadFlagPanel countries', linksError)
    return null
  }

  const countries: FlagCountry[] = links
    .map((row) => {
      const c = row.flag_countries
      if (!c || Array.isArray(c)) return null
      return c as FlagCountry
    })
    .filter((c): c is FlagCountry => c !== null)

  return {
    ...panel,
    countries,
  }
}
