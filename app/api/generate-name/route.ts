export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { NamePreference, GeneratedName } from '@/services/nameGenerator';
import { surnames } from '@/data/surnames';
import OpenAI from 'openai';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

// 系统提示词
const SYSTEM_PROMPT = `You are a Chinese name generator. Generate culturally appropriate Chinese names based on the given preferences.

IMPORTANT RULES:
1. The total name length (surname + given name) MUST match the specified number of characters.
2. ALWAYS use single-character surnames (e.g., 李, 王, 张, 刘). NEVER use double-character surnames (like 欧阳, 司马).
3. For example, if total length is 3, and surname is "李", then given name should be 2 characters.
4. If an era is specified, generate names that match the style of that period:
   - 50s: Revolutionary era, names often reflect ideals like 建国(nation building), 卫东(protecting the east)
   - 60s: Idealistic era, names often include characters like 红(red), 军(army), 卫(protect)
   - 70s: Revival era, names often reflect hope and progress, like 振华(reviving China), 国强(strong nation)
   - 80s: Reform era, names become more diverse, often include characters like 伟(great), 强(strong)
   - 90s: Development era, names become more elegant, using characters like 婷(graceful), 俊(talented)
   - 00s: Modern era, names are more unique and international, often using less common characters

You must return a JSON object in this exact format:
{
  "names": [
    {
      "surname": {
        "simplified": "李",
        "pinyin": "li3",
        "tone": 3
      },
      "characters": [
        {
          "simplified": "明",
          "pinyin": "ming2",
          "meaning": ["bright", "clear"],
          "tone": 2
        }
      ],
      "explanation": "This name means bright and clear..."
    }
  ]
}

VALIDATION:
- Always return exactly 3 names in the "names" array
- Each name's total length (surname + characters array) must match the requested length
- Each name should reflect the specified era's naming style if provided
- Only use single-character surnames`;

export async function POST(request: NextRequest) {
  try {
    const preferences: NamePreference = await request.json();

    // 验证输入
    if (!preferences.numberOfCharacters || ![2, 3, 4].includes(preferences.numberOfCharacters)) {
      return NextResponse.json(
        { error: 'Total name length must be between 2 and 4 characters' },
        { status: 400 }
      );
    }

    // 如果没有提供姓氏，随机选择一个单字姓氏
    if (!preferences.surname) {
      // 过滤出单字姓氏
      const singleCharacterSurnames = surnames.filter(s => s.simplified.length === 1);
      const randomIndex = Math.floor(Math.random() * singleCharacterSurnames.length);
      preferences.surname = singleCharacterSurnames[randomIndex].simplified;
    } else if (preferences.surname.length > 1) {
      // 如果用户提供了复姓，返回错误
      return NextResponse.json(
        { error: 'Only single-character surnames are supported to maintain the correct total name length' },
        { status: 400 }
      );
    }

    const userPrompt = buildPrompt(preferences);
    console.log('User prompt:', userPrompt);

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', response);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid JSON format from AI');
    }

    if (!parsedResponse.names || !Array.isArray(parsedResponse.names)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    const names = parsedResponse.names;
    if (names.length === 0) {
      throw new Error('No names generated');
    }

    // 验证名字格式和总字数
    names.forEach((name: GeneratedName) => {
      if (!name.surname || !name.characters || !Array.isArray(name.characters)) {
        throw new Error('Invalid name format');
      }
      const totalLength = 1 + name.characters.length; // 姓氏1个字 + 名字的字数
      if (totalLength !== preferences.numberOfCharacters) {
        throw new Error(`Generated name has ${totalLength} characters in total, but ${preferences.numberOfCharacters} were requested`);
      }
    });

    return NextResponse.json({ names });

  } catch (error) {
    console.error('Error generating names:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 构建 prompt
function buildPrompt(preferences: NamePreference): string {
  const parts: string[] = [];

  parts.push(`IMPORTANT: Generate names with total length of ${preferences.numberOfCharacters} characters (including surname).`);

  if (preferences.englishName) {
    parts.push(`English name: ${preferences.englishName}`);
  }

  parts.push(`Gender: ${preferences.gender || 'NEUTRAL'}`);

  if (preferences.desiredMeanings?.length) {
    parts.push(`Desired meanings: ${preferences.desiredMeanings.join(', ')}`);
  }

  if (preferences.surname) {
    parts.push(`Surname: ${preferences.surname}`);
  }

  if (preferences.era) {
    parts.push(`Era style: ${preferences.era} - Please generate names that match the naming style of this period`);
  }

  const givenNameLength = preferences.numberOfCharacters - 1;
  parts.push(`\nREMINDER: Since the total length should be ${preferences.numberOfCharacters} characters, and surname is 1 character, the given name should be exactly ${givenNameLength} characters.`);

  return parts.join('\n');
} 