
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shuffle } from 'lucide-react';
import { AVATAR_STYLES, generateAvatarDataUrl, getRandomSeed } from '@/lib/avatar-utils';

interface AvatarCreatorProps {
  onAvatarCreate: (style: string, seed: string) => void;
  initialStyle?: string;
  initialSeed?: string;
}

export default function AvatarCreator({ onAvatarCreate, initialStyle, initialSeed }: AvatarCreatorProps) {
  const [avatarStyle, setAvatarStyle] = useState(initialStyle || 'adventurer');
  const [avatarSeed, setAvatarSeed] = useState(initialSeed || getRandomSeed());
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const preview = generateAvatarDataUrl(avatarStyle, avatarSeed);
    setAvatarPreview(preview);
  }, [avatarStyle, avatarSeed]);

  const handleRandomize = () => {
    const newSeed = getRandomSeed();
    setAvatarSeed(newSeed);
    onAvatarCreate(avatarStyle, newSeed);
  };

  const handleStyleChange = (newStyle: string) => {
    setAvatarStyle(newStyle);
    onAvatarCreate(newStyle, avatarSeed);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Card className="w-32 h-32 flex items-center justify-center overflow-hidden">
          <CardContent className="p-0">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full"
              />
            )}
          </CardContent>
        </Card>

        <div className="w-full space-y-3">
          <div>
            <Label>Avatar Style</Label>
            <Select value={avatarStyle} onValueChange={handleStyleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {AVATAR_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleRandomize}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Randomize Avatar
          </Button>
        </div>
      </div>
    </div>
  );
}
