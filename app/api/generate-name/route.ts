import { NextRequest, NextResponse } from 'next/server';
import { generateName, NamePreference } from '@/services/nameGenerator';

export async function POST(req: NextRequest) {
  try {
    const preferences: NamePreference = await req.json();
    console.log('API received preferences:', preferences);
    
    // Validate input
    if (!preferences.numberOfCharacters || ![2, 3].includes(preferences.numberOfCharacters)) {
      console.log('Invalid number of characters:', preferences.numberOfCharacters);
      return NextResponse.json(
        { error: 'Number of characters must be 2 or 3' },
        { status: 400 }
      );
    }

    // Generate name
    console.log('Calling generateName');
    const generatedName = await generateName(preferences);
    console.log('Generated name:', generatedName);

    return NextResponse.json({ name: generatedName });
  } catch (error) {
    console.error('Error in name generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate name' },
      { status: 500 }
    );
  }
} 