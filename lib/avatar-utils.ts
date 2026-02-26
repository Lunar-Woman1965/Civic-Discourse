
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';
import * as avataaars from '@dicebear/avataaars';
import * as bottts from '@dicebear/bottts';
import * as lorelei from '@dicebear/lorelei';
import * as micah from '@dicebear/micah';
import * as pixelArt from '@dicebear/pixel-art';
import * as bigSmile from '@dicebear/big-smile';

export const AVATAR_STYLES = [
  { value: 'adventurer', label: 'Adventurer', description: 'Cartoon characters' },
  { value: 'avataaars', label: 'Avataaars', description: 'Illustrated people' },
  { value: 'bigSmile', label: 'Big Smile', description: 'Happy faces' },
  { value: 'bottts', label: 'Bottts', description: 'Robots' },
  { value: 'lorelei', label: 'Lorelei', description: 'Simple faces' },
  { value: 'micah', label: 'Micah', description: 'Artistic portraits' },
  { value: 'pixelArt', label: 'Pixel Art', description: '8-bit style' },
];

const styleMap = {
  adventurer,
  avataaars,
  bottts,
  lorelei,
  micah,
  pixelArt,
  bigSmile,
};

export function generateAvatarSvg(style: string, seed: string): string {
  const collection = styleMap[style as keyof typeof styleMap] || adventurer;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avatar = createAvatar(collection as any, {
    seed,
    size: 128,
  });

  return avatar.toString();
}

export function generateAvatarDataUrl(style: string, seed: string): string {
  const svg = generateAvatarSvg(style, seed);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export function getRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}
