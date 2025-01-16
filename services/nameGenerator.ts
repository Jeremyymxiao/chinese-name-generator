import type { NamePreference, GeneratedName } from '@/types/name-generator';
import { surnames } from '@/data/surnames';

// 缓存生成的名字
const nameCache = new Map<string, GeneratedName[]>();

// 生成缓存key
function generateCacheKey(preferences: NamePreference): string {
  return JSON.stringify({
    englishName: preferences.englishName || '',
    gender: preferences.gender || 'NEUTRAL',
    numberOfCharacters: preferences.numberOfCharacters,
    desiredMeanings: preferences.desiredMeanings || [],
    surname: preferences.surname || ''
  });
}

export async function generateName(preferences: NamePreference): Promise<GeneratedName[]> {
  // 检查缓存
  const cacheKey = generateCacheKey(preferences);
  const cachedNames = nameCache.get(cacheKey);
  if (cachedNames) {
    console.log('Returning cached names');
    return cachedNames;
  }

  try {
    // 调用名字生成 API
    const response = await fetch('/api/generate-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate names');
    }

    const data = await response.json();
    const names = data.names;

    // 缓存结果
    nameCache.set(cacheKey, names);
    
    // 如果缓存太大，删除最早的条目
    if (nameCache.size > 100) {
      const firstKey = nameCache.keys().next().value;
      if (firstKey) {
        nameCache.delete(firstKey);
      }
    }

    return names;
  } catch (error) {
    console.error('Error generating names:', error);
    throw error;
  }
}

export type { NamePreference, GeneratedName }; 