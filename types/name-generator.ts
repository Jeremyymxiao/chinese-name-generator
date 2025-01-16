export type Gender = 'M' | 'F' | 'NEUTRAL';

export type Era = '50s' | '60s' | '70s' | '80s' | '90s' | '00s';

export interface NamePreference {
  englishName?: string;
  gender?: Gender;
  numberOfCharacters: 2 | 3 | 4;
  desiredMeanings?: string[];
  surname?: string;
  era?: Era;
}

export interface GeneratedName {
  surname: {
    simplified: string;
    pinyin: string;
    tone: number;
  };
  characters: {
    simplified: string;
    pinyin: string;
    meaning: string[];
    tone: number;
  }[];
  explanation: string;
}

export interface NameGenerationResponse {
  names: GeneratedName[];
} 