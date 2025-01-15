'use client';

import { useState } from 'react';
import { NameGeneratorForm } from '@/components/name-generator/NameGeneratorForm';
import { GeneratedNamesList } from '@/components/name-generator/GeneratedNamesList';
import { NamePreference } from '@/services/nameGenerator';
import type { GeneratedName } from '@/services/nameGenerator';

export default function GeneratePage() {
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [lastPreferences, setLastPreferences] = useState<NamePreference | null>(null);

  const handleGenerateNames = async (preferences: NamePreference) => {
    try {
      console.log('Generating name with preferences:', preferences);
      setLastPreferences(preferences);
      const response = await fetch('/api/generate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to generate name');
      }

      const data = await response.json();
      console.log('Received generated name:', data);
      setGeneratedNames(prev => [...data.name, ...prev]);
      console.log('Updated state with name:', data.name);
    } catch (error) {
      console.error('Error generating name:', error);
      throw error;
    }
  };

  const handleRegenerate = async (index: number) => {
    if (lastPreferences) {
      await handleGenerateNames(lastPreferences);
      setGeneratedNames(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="container py-36">
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-center mb-4">
          Generate Your Chinese Name
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Fill in your preferences below to generate culturally appropriate Chinese names
        </p>
        <NameGeneratorForm onSubmit={handleGenerateNames} />
      </div>

      {generatedNames.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Your Generated Names
          </h2>
          <GeneratedNamesList
            names={generatedNames}
            onRegenerateName={handleRegenerate}
          />
        </div>
      )}
    </div>
  );
} 