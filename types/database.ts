export type Gender = 'M' | 'F' | 'NEUTRAL';

export interface Character {
  id: string;
  simplified: string;
  pinyin: string;
  meanings: string[];
  frequency: number;
  strokes: number;
  is_common: boolean;
  gender: Gender | null;
  positions: string[];
  combinations: string[];
  tone: number;
  created_at: string;
  updated_at: string;
}

export interface NameEntry {
  id: string;
  popularity: number;
  gender: Gender | null;
  style: string | null;
  created_at: string;
}

export interface CharacterNameEntry {
  character_id: string;
  name_entry_id: string;
}

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: Character;
        Insert: Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Character, 'id'>>;
      };
      name_entries: {
        Row: NameEntry;
        Insert: Omit<NameEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<NameEntry, 'id'>>;
      };
      character_name_entries: {
        Row: CharacterNameEntry;
        Insert: CharacterNameEntry;
        Update: Partial<CharacterNameEntry>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      gender: Gender;
    };
  };
} 