export type Gender = 'M' | 'F' | 'NEUTRAL';

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

export interface NameGenerationResponse {
  names: GeneratedName[];
} 