'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { NamePreference, Gender } from '@/types/name-generator';
import { PREDEFINED_MEANINGS, ERA_OPTIONS } from '@/constants/name-generator';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  englishName: z.string().optional(),
  surname: z.string().optional(),
  gender: z.enum(['male', 'female', 'neutral']),
  predefinedMeaning: z.string().optional(),
  meaningPreferences: z.string().optional(),
  numberOfCharacters: z.number()
    .refine(n => n >= 2 && n <= 4, {
      message: 'Number of characters must be between 2 and 4'
    }),
  era: z.enum(['50s', '60s', '70s', '80s', '90s', '00s']).optional()
});

type FormValues = z.infer<typeof formSchema>;

const genderMap: Record<string, Gender> = {
  male: 'M',
  female: 'F',
  neutral: 'NEUTRAL'
};

export function NameGeneratorForm({ 
  onSubmit 
}: { 
  onSubmit: (data: NamePreference) => Promise<void> 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      englishName: '',
      surname: '',
      gender: 'neutral',
      predefinedMeaning: undefined,
      meaningPreferences: '',
      numberOfCharacters: 2,
      era: undefined,
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      setProgress(0);
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const meaningPreferences = [];
      
      if (values.predefinedMeaning) {
        meaningPreferences.push(values.predefinedMeaning);
      }
      
      if (values.meaningPreferences) {
        meaningPreferences.push(
          ...values.meaningPreferences
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        );
      }

      if (meaningPreferences.length === 0) {
        clearInterval(progressInterval);
        setProgress(0);
        toast.error('Please select a predefined meaning or enter custom meanings');
        return;
      }

      const preferences: NamePreference = {
        englishName: values.englishName || undefined,
        surname: values.surname || undefined,
        gender: genderMap[values.gender],
        numberOfCharacters: values.numberOfCharacters as 2 | 3 | 4,
        desiredMeanings: meaningPreferences,
        era: values.era
      };

      console.log('Submitting preferences:', preferences);
      await onSubmit(preferences);
      
      // Complete the progress bar
      clearInterval(progressInterval);
      setProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setProgress(0);
      }, 500);

    } catch (error) {
      console.error('Name generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to generate name: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="englishName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>English Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your English name"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                If you have an English name, we can use it as reference
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your surname in Chinese"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                If you have a Chinese surname, we'll use it instead of generating one
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="neutral">Gender Neutral</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the gender association for your name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="predefinedMeaning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Common Meanings</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meaning category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PREDEFINED_MEANINGS.map((meaning) => (
                    <SelectItem key={meaning.value} value={meaning.value}>
                      {meaning.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose from common meaning categories for your name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meaningPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Meanings (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional desired meanings (e.g., wisdom, strength, beauty)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optionally enter additional meanings or themes you'd like in your name, separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfCharacters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Name Length</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={2}
                  max={4}
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Choose the total length of your name (including surname):
                - 2 characters: Surname + 1 character (e.g., 李明)
                - 3 characters: Surname + 2 characters (e.g., 李明智)
                - 4 characters: Surname + 3 characters (e.g., 李明智慧)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="era"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name Style Era</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an era for name style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ERA_OPTIONS.map((era) => (
                    <SelectItem key={era.value} value={era.value}>
                      {era.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a historical era to match the naming style of that period
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Names'}
        </Button>

        {isLoading && (
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Generating names...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 w-full" />
            </div>
            <div className="text-sm text-center text-muted-foreground animate-pulse">
              Creating unique names based on your preferences...
            </div>
          </div>
        )}
      </form>
    </Form>
  );
} 