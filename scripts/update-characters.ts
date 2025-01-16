import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List of surnames that should only be used as last names
const SINGLE_SURNAMES = [
  '李', '王', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周',
  '徐', '孙', '马', '朱', '胡', '郭'
];

const COMPOUND_SURNAMES = [
  '欧阳', '司马', '诸葛', '上官'
];

const SURNAMES = [...SINGLE_SURNAMES, ...COMPOUND_SURNAMES];

async function updateCharacters() {
  try {
    console.log('Starting character update...');

    // First, get all characters
    const { data: characters, error: fetchError } = await supabase
      .from('characters')
      .select('simplified');

    if (fetchError) {
      throw fetchError;
    }

    if (!characters || characters.length === 0) {
      throw new Error('No characters found in database');
    }

    console.log(`Found ${characters.length} characters`);

    // Get all non-surname characters for combinations
    const givenNameChars = characters
      .map(c => c.simplified)
      .filter(char => !SURNAMES.includes(char));

    console.log(`Found ${givenNameChars.length} characters for given names`);

    // Update each character
    for (const char of characters) {
      const isSurname = SURNAMES.includes(char.simplified);
      
      // For given names, we'll only allow FIRST and LAST positions
      // This way, compound surnames can still have two-character given names
      const positions = isSurname 
        ? ['SURNAME']
        : ['FIRST', 'LAST']; // Removed MIDDLE position to limit to 2 characters for given names

      const update = {
        frequency: 60,  // Set equal frequency for all characters
        combinations: isSurname ? [] : givenNameChars.filter(s => s !== char.simplified), // Surnames don't combine
        positions: positions
      };

      const { error: updateError } = await supabase
        .from('characters')
        .update(update)
        .eq('simplified', char.simplified);

      if (updateError) {
        console.error(`Error updating character ${char.simplified}:`, updateError);
        continue;
      }

      console.log(`Updated character: ${char.simplified} (${isSurname ? (COMPOUND_SURNAMES.includes(char.simplified) ? 'compound surname' : 'surname') : 'given name'})`);
    }

    console.log('Character update completed successfully');
  } catch (error) {
    console.error('Error updating characters:', error);
  }
}

// Run the update
updateCharacters(); 