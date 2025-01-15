import { getSupabaseClient } from '@/models/db';
import type { Character, Gender, NameEntry } from '@/types/database';

export interface NamePreference {
  gender?: Gender;
  numberOfCharacters: 2 | 3;
  desiredMeanings?: string[];
  avoidCharacters?: string[];
}

export interface GeneratedName {
  characters: {
    simplified: string;
    pinyin: string;
    meaning: string[];
    tone: number;
  }[];
  score: number;
  explanation: string;
}

export async function getCharacterBySimplified(simplified: string): Promise<Character | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('simplified', simplified)
    .single();

  if (error) {
    console.error('Error fetching character:', error);
    return null;
  }

  return data;
}

export async function getCharactersByGender(gender: Gender): Promise<Character[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('gender', gender)
    .order('frequency', { ascending: false });

  if (error) {
    console.error('Error fetching characters by gender:', error);
    return [];
  }

  return data || [];
}

export async function getCharactersByPosition(position: string): Promise<Character[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .contains('positions', [position])
    .order('frequency', { ascending: false });

  if (error) {
    console.error('Error fetching characters by position:', error);
    return [];
  }

  return data || [];
}

export async function getCommonCharacters(): Promise<Character[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_common', true)
    .order('frequency', { ascending: false });

  if (error) {
    console.error('Error fetching common characters:', error);
    return [];
  }

  return data || [];
}

export async function saveNameEntry(
  characters: Character[],
  gender: Gender | null = null,
  style: string | null = null
): Promise<NameEntry | null> {
  const supabase = getSupabaseClient();

  // First create the name entry
  const { data: nameEntry, error: nameError } = await supabase
    .from('name_entries')
    .insert({
      gender,
      style,
      popularity: 1,
    })
    .select()
    .single();

  if (nameError || !nameEntry) {
    console.error('Error creating name entry:', nameError);
    return null;
  }

  // Then create the character-name relationships
  const characterLinks = characters.map(char => ({
    character_id: char.id,
    name_entry_id: nameEntry.id,
  }));

  const { error: linkError } = await supabase
    .from('character_name_entries')
    .insert(characterLinks);

  if (linkError) {
    console.error('Error linking characters to name:', linkError);
    // You might want to delete the name entry here since the linking failed
    return null;
  }

  return nameEntry;
}

export async function incrementNamePopularity(nameId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('name_entries')
    .update({ popularity: supabase.rpc('increment') })
    .eq('id', nameId);

  if (error) {
    console.error('Error incrementing name popularity:', error);
  }
}

export async function getPopularNames(limit: number = 10): Promise<NameEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('name_entries')
    .select('*, characters!character_name_entries(*)')
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular names:', error);
    return [];
  }

  return data || [];
} 