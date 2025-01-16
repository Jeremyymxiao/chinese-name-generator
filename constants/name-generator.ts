export const PREDEFINED_MEANINGS = [
  { value: 'bright', label: 'Bright & Intelligent (明智)' },
  { value: 'virtuous', label: 'Virtuous & Kind (德善)' },
  { value: 'strong', label: 'Strong & Brave (强勇)' },
  { value: 'peaceful', label: 'Peaceful & Harmonious (和平)' },
  { value: 'beautiful', label: 'Beautiful & Elegant (美丽)' },
  { value: 'prosperous', label: 'Prosperous & Successful (富贵)' },
  { value: 'cultured', label: 'Cultured & Refined (文雅)' },
  { value: 'natural', label: 'Natural & Pure (自然)' },
] as const;

export const ERA_OPTIONS = [
  { value: '50s', label: 'Revolutionary Era - 1950s (革命年代)' },
  { value: '60s', label: 'Idealistic Era - 1960s (理想年代)' },
  { value: '70s', label: 'Revival Era - 1970s (复兴年代)' },
  { value: '80s', label: 'Reform Era - 1980s (改革年代)' },
  { value: '90s', label: 'Development Era - 1990s (发展年代)' },
  { value: '00s', label: 'Modern Era - 2000s (现代年代)' },
] as const;

export type PredefinedMeaning = typeof PREDEFINED_MEANINGS[number]['value']; 