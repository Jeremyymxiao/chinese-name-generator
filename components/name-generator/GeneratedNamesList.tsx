'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GeneratedName } from '@/services/nameGenerator';
import { toast } from 'sonner';
import { Copy, FileText, RefreshCw } from 'lucide-react';

interface GeneratedNamesListProps {
  names: GeneratedName[];
  onRegenerateName: (index: number) => Promise<void>;
}

export function GeneratedNamesList({ names, onRegenerateName }: GeneratedNamesListProps) {
  const handleCopyName = (name: GeneratedName) => {
    const fullName = name.surname.simplified + name.characters.map(c => c.simplified).join('');
    navigator.clipboard.writeText(fullName);
    toast.success('Name copied to clipboard!');
  };

  const handleCopyPinyin = (name: GeneratedName) => {
    const pinyin = `${name.surname.pinyin} ${name.characters.map(c => c.pinyin).join(' ')}`;
    navigator.clipboard.writeText(pinyin);
    toast.success('Pinyin copied to clipboard!');
  };

  const handleRegenerate = (index: number) => {
    if (onRegenerateName) {
      onRegenerateName(index);
    }
  };

  return (
    <div className="space-y-6">
      {names.map((name, index) => (
        <div
          key={index}
          className="relative rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                {name.surname.simplified}{name.characters.map(c => c.simplified).join('')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {name.surname.pinyin} {name.characters.map(c => c.pinyin).join(' ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyName(name)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyPinyin(name)}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRegenerate(index)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-xl font-medium">{name.surname.simplified}</span>
                <p className="text-sm text-muted-foreground">
                  {name.surname.pinyin}
                </p>
                <p className="text-sm text-muted-foreground">
                  Surname
                </p>
              </div>
              {name.characters.map((char, charIndex) => (
                <div key={charIndex} className="space-y-1">
                  <span className="text-xl font-medium">{char.simplified}</span>
                  <p className="text-sm text-muted-foreground">
                    {char.pinyin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {char.meaning.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {name.explanation}
          </div>
        </div>
      ))}
    </div>
  );
} 