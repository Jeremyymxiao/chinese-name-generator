import { createClient } from '@supabase/supabase-js';
import { Character, Gender } from '../types/database';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Try to load environment variables from .env.local if they're not already set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    dotenv.config({ path: '.env.local' });
  } catch (error) {
    console.warn('Could not load .env.local file');
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('SUPABASE_SERVICE_ROLE_KEY');
  throw new Error('Missing Supabase credentials. Please set the required environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadJsonData() {
  try {
    const charactersPath = path.join(process.cwd(), 'data', 'characters.json');
    const surnamesPath = path.join(process.cwd(), 'data', 'surnames.ts');

    console.log('Loading characters from:', charactersPath);
    console.log('Loading surnames from:', surnamesPath);

    const charactersData = JSON.parse(await fs.readFile(charactersPath, 'utf-8'));
    const surnamesContent = await fs.readFile(surnamesPath, 'utf-8');
    
    // Extract surnames array from the TypeScript file
    const surnamesMatch = surnamesContent.match(/const surnames\s*=\s*(\[[\s\S]*?\];)/);
    if (!surnamesMatch) {
      throw new Error('Could not find surnames array in surnames.ts');
    }

    // Create a module from the surnames array
    const surnamesModule = new Function(`
      ${surnamesMatch[0]}
      return surnames;
    `)();

    return { characters: charactersData, surnames: surnamesModule };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

async function migrateData() {
  try {
    const { characters, surnames } = await loadJsonData();
    console.log(`Loaded ${characters.length} characters and ${surnames.length} surnames`);

    // Process characters in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < characters.length; i += BATCH_SIZE) {
      const batch = characters.slice(i, i + BATCH_SIZE).map((char: any) => ({
        simplified: char.simplified,
        pinyin: char.pinyin,
        meanings: char.meanings,
        frequency: char.frequency || 1,
        strokes: char.strokes || 0,
        is_common: char.isCommon || false,
        gender: char.gender as Gender || null,
        positions: char.positions || [],
        combinations: char.combinations || [],
        tone: char.tone || 1
      }));

      const { error } = await supabase
        .from('characters')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        continue;
      }

      console.log(`Inserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(characters.length / BATCH_SIZE)}`);
    }

    // Process surnames
    for (let i = 0; i < surnames.length; i += BATCH_SIZE) {
      const batch = surnames.slice(i, i + BATCH_SIZE).map((surname: any) => ({
        simplified: surname.simplified,
        pinyin: surname.pinyin,
        meanings: [surname.meanings[0]], // Take the first meaning which is the surname meaning
        frequency: surname.frequency || 1,
        strokes: surname.strokes || 0,
        is_common: true,
        gender: null as Gender | null,
        positions: ['FIRST'],
        combinations: [],
        tone: surname.tone || 1
      }));

      const { error } = await supabase
        .from('characters')
        .insert(batch);

      if (error) {
        console.error(`Error inserting surname batch ${i / BATCH_SIZE + 1}:`, error);
        continue;
      }

      console.log(`Inserted surname batch ${i / BATCH_SIZE + 1} of ${Math.ceil(surnames.length / BATCH_SIZE)}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

migrateData().catch(console.error); 