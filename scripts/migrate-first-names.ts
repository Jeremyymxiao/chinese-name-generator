import { createClient } from '@supabase/supabase-js';
import { firstNameCharacters } from '@/data/first-name-characters';
import type { Gender } from '@/types/database';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function migrateFirstNameCharacters() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const BATCH_SIZE = 50;

  console.log(`Starting migration of ${firstNameCharacters.length} first name characters`);

  // Process characters in batches
  for (let i = 0; i < firstNameCharacters.length; i += BATCH_SIZE) {
    const batch = firstNameCharacters.slice(i, i + BATCH_SIZE).map(char => ({
      simplified: char.simplified,
      pinyin: char.pinyin,
      meanings: char.meanings,
      frequency: char.frequency || 1,
      strokes: char.strokes || 0,
      is_common: char.is_common || false,
      gender: char.gender as Gender || null,
      positions: char.positions || [],
      combinations: char.combinations || [],
      tone: char.tone || 1
    }));

    const { error } = await supabase
      .from('characters')
      .upsert(batch, {
        onConflict: 'simplified'
      });

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
      continue;
    }

    console.log(`Inserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(firstNameCharacters.length / BATCH_SIZE)}`);
  }

  console.log('First name characters migration completed');
}

migrateFirstNameCharacters().catch(console.error); 