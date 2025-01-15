import type { Character, Gender } from '@/types/database';
import {
  getCharactersByGender,
  getCharactersByPosition,
  getCommonCharacters,
  saveNameEntry,
} from './character';
import { surnames } from '@/data/surnames';

export interface NamePreference {
  gender?: Gender;
  numberOfCharacters: 2 | 3;
  desiredMeanings?: string[];
  avoidCharacters?: string[];
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
  score: number;
  explanation: string;
}

function calculateNameScore(
  characters: Character[],
  preferences: NamePreference
): number {
  let score = 0;

  // Base score from character frequency
  score += characters.reduce((sum, char) => sum + char.frequency, 0) / characters.length;

  // Bonus for matching gender preference
  if (preferences.gender) {
    const genderMatch = characters.filter(
      char => char.gender === preferences.gender || char.gender === 'NEUTRAL'
    ).length;
    score += (genderMatch / characters.length) * 20;
  }

  // Bonus for matching desired meanings
  if (preferences.desiredMeanings && preferences.desiredMeanings.length > 0) {
    const meaningMatches = characters.reduce((matches, char) => {
      return matches + char.meanings.filter(meaning =>
        preferences.desiredMeanings!.some(desired =>
          meaning.toLowerCase().includes(desired.toLowerCase())
        )
      ).length;
    }, 0);
    score += meaningMatches * 15;
  }

  // Penalty for using avoided characters
  if (preferences.avoidCharacters && preferences.avoidCharacters.length > 0) {
    const avoidedUsed = characters.filter(char =>
      preferences.avoidCharacters!.includes(char.simplified)
    ).length;
    score -= avoidedUsed * 50;
  }

  // Bonus for good tone patterns
  const tones = characters.map(char => char.tone);
  if (tones.length === 2) {
    // For two-character names, prefer different tones
    if (tones[0] !== tones[1]) {
      score += 10;
    }
  } else if (tones.length === 3) {
    // For three-character names, prefer a pattern
    const uniqueTones = new Set(tones).size;
    if (uniqueTones === 3) {
      score += 15; // All different tones
    } else if (uniqueTones === 2) {
      score += 10; // Two different tones
    }
  }

  return score;
}

function generateExplanation(
  surname: typeof surnames[0],
  characters: Character[],
  score: number,
  preferences: NamePreference
): string {
  const meanings = characters.map((char, i) => {
    const position = i === 0 ? 'first' : i === characters.length - 1 ? 'last' : 'middle';
    return `The ${position} character "${char.simplified}" (${char.pinyin}) means ${char.meanings.join(', ')}`;
  });

  let explanation = `This name combines the surname "${surname.simplified}" (${surname.pinyin}) with:\n${meanings.join('\n')}`;

  if (preferences.gender) {
    const genderSuitability = characters.every(
      char => char.gender === preferences.gender || char.gender === 'NEUTRAL'
    )
      ? 'well-suited'
      : 'partially suited';
    explanation += `\n\nThe given name is ${genderSuitability} for ${preferences.gender.toLowerCase()} names.`;
  }

  if (score > 80) {
    explanation += '\n\nThis is a highly harmonious combination.';
  } else if (score > 60) {
    explanation += '\n\nThis is a good combination.';
  } else {
    explanation += '\n\nThis is an acceptable combination.';
  }

  return explanation;
}

export async function generateName(preferences: NamePreference): Promise<GeneratedName[]> {
  // Get potential characters based on preferences
  const [firstChars, middleChars, lastChars] = await Promise.all([
    getCharactersByPosition('FIRST'),
    preferences.numberOfCharacters === 3 ? getCharactersByPosition('MIDDLE') : Promise.resolve([]),
    getCharactersByPosition('LAST'),
  ]);

  // Filter by gender if specified
  const genderFilter = (char: Character) =>
    !preferences.gender || char.gender === preferences.gender || char.gender === 'NEUTRAL';

  const filteredFirst = firstChars.filter(genderFilter);
  const filteredMiddle = middleChars.filter(genderFilter);
  const filteredLast = lastChars.filter(genderFilter);

  // Generate combinations and score them
  const combinations: { chars: Character[]; score: number }[] = [];

  for (const first of filteredFirst) {
    if (preferences.avoidCharacters?.includes(first.simplified)) continue;

    if (preferences.numberOfCharacters === 2) {
      for (const last of filteredLast) {
        if (preferences.avoidCharacters?.includes(last.simplified)) continue;
        if (!first.combinations.includes(last.simplified)) continue;

        const chars = [first, last];
        const score = calculateNameScore(chars, preferences);
        combinations.push({ chars, score });
      }
    } else {
      for (const middle of filteredMiddle) {
        if (preferences.avoidCharacters?.includes(middle.simplified)) continue;
        if (!first.combinations.includes(middle.simplified)) continue;

        for (const last of filteredLast) {
          if (preferences.avoidCharacters?.includes(last.simplified)) continue;
          if (!middle.combinations.includes(last.simplified)) continue;

          const chars = [first, middle, last];
          const score = calculateNameScore(chars, preferences);
          combinations.push({ chars, score });
        }
      }
    }
  }

  // Sort by score and get the top 3 combinations
  combinations.sort((a, b) => b.score - a.score);
  const top3 = combinations.slice(0, 3);

  // Save the generated names
  await Promise.all(
    top3.map(async ({ chars }) => {
      if (chars.length > 0) {
        await saveNameEntry(chars, preferences.gender);
      }
    })
  );

  // Get a random surname weighted by frequency
  const totalFrequency = surnames.reduce((sum, s) => sum + s.frequency, 0);
  let randomFreq = Math.random() * totalFrequency;
  let selectedSurname = surnames[0];
  
  for (const surname of surnames) {
    randomFreq -= surname.frequency;
    if (randomFreq <= 0) {
      selectedSurname = surname;
      break;
    }
  }

  return top3.map(({ chars, score }) => ({
    surname: {
      simplified: selectedSurname.simplified,
      pinyin: selectedSurname.pinyin,
      tone: selectedSurname.tone,
    },
    characters: chars.map(char => ({
      simplified: char.simplified,
      pinyin: char.pinyin,
      meaning: char.meanings,
      tone: char.tone,
    })),
    score,
    explanation: generateExplanation(selectedSurname, chars, score, preferences),
  }));
} 