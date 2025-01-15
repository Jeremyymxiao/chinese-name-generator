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

const formSchema = z.object({
  gender: z.enum(['male', 'female', 'neutral']),
  meaningPreferences: z.string().min(1, {
    message: 'Please enter at least one meaning preference.',
  }),
  syllableCount: z.number()
    .refine(n => n === 2 || n === 3, {
      message: 'Number of characters must be either 2 or 3'
    }),
  avoidCharacters: z.string().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'neutral',
      meaningPreferences: '',
      syllableCount: 2,
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      const meaningPreferences = values.meaningPreferences
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const preferences: NamePreference = {
        gender: genderMap[values.gender],
        numberOfCharacters: values.syllableCount as 2 | 3,
        desiredMeanings: meaningPreferences,
        avoidCharacters: values.avoidCharacters ? values.avoidCharacters.split('') : undefined
      };

      await onSubmit(preferences);
      toast.success('Names generated successfully!');
    } catch (error) {
      toast.error('Failed to generate names. Please try again.');
      console.error('Name generation error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
          name="meaningPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desired Meanings</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter desired meanings (e.g., wisdom, strength, beauty)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter meanings or themes you'd like in your name, separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="syllableCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Characters</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={2}
                  max={3}
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Choose how many characters you want in your name (2-3)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avoidCharacters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Characters to Avoid</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter characters to avoid"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Enter specific characters you want to avoid
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Names'}
        </Button>
      </form>
    </Form>
  );
} 