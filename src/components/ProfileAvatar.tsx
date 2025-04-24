// src/components/ProfileAvatar.tsx
// დავამატოთ ზომების უკეთესი კონტროლი

"use client";

import React, { useState, useEffect } from 'react';
import Image from "./Image";
import dynamic from 'next/dynamic';
import { shouldUseBigHeads } from '@/utils/avatarHelper';

// დინამიურად ჩავტვირთოთ BigHead კომპონენტი
const BigHead = dynamic(
  () => import('@bigheads/core').then(mod => mod.BigHead),
  { ssr: false }
);

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  username: string;
  gender?: string | null | undefined;
  avatarProps?: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fixedSize?: boolean; // დავამატოთ ეს ოფცია
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  username,
  gender,
  avatarProps,
  size = 'md',
  className = '',
  fixedSize = false, // ნაგულისხმევად false
}) => {
  const [parsedProps, setParsedProps] = useState<any>(null);
  
  useEffect(() => {
    if (avatarProps) {
      try {
        const parsed = JSON.parse(avatarProps);
        setParsedProps(parsed);
      } catch (e) {
        console.error("Error parsing avatarProps JSON for", username, e);
      }
    }
  }, [avatarProps, username]);
  
  // ზომების უკეთესი კონფიგურაცია
  const sizeConfig = {
    sm: { width: 40, height: 40 },
    md: { width: 100, height: 100 },
    lg: { width: 200, height: 200 },
  };
  
  const { width, height } = sizeConfig[size];
  const useBigHeads = shouldUseBigHeads(imageUrl);
  
  // საწყისი პარამეტრები BigHead-ისთვის 
  const defaultProps = {
    accessory: 'none',
    body: gender === 'female' ? 'breasts' : 'chest',
    circleColor: 'blue',
    clothing: 'shirt',
    clothingColor: 'blue',
    eyebrows: 'raised',
    eyes: 'normal',
    facialHair: 'none',
    graphic: 'none',
    hair: gender === 'female' ? 'long' : 'short',
    hairColor: 'black',
    hat: 'none',
    hatColor: 'red',
    lashes: gender === 'female',
    lipColor: 'red',
    mouth: 'serious',
    skinTone: 'light',
  };

  // მომხმარებლის სახელიდან უნიკალური პროპების გენერაცია, თუ avatarProps არაა
  const getSeedBasedProps = () => {
    const seed = generateSeedFromUsername(username);
    
    // სიმარტივისთვის მხოლოდ რამდენიმე თვისებას ვცვლით
    const hairColors = ['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'] as const;
    const hairStyles = ['short', 'long', 'bun', 'pixie', 'buzz', 'afro'] as const;
    const skinTones = ['light', 'brown', 'dark', 'yellow', 'red', 'black'] as const;
    
    return {
      ...defaultProps,
      hairColor: hairColors[Math.abs(seed) % hairColors.length],
      hair: hairStyles[Math.abs(seed >> 3) % hairStyles.length],
      skinTone: skinTones[Math.abs(seed >> 6) % skinTones.length],
    };
  };

  // ეს ფუნქცია ემატება სახელიდან hash-ის შესაქმნელად
  const generateSeedFromUsername = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  // სტილის კლასები
  const containerStyle = fixedSize 
    ? { width: `${width}px`, height: `${height}px` } 
    : {};

  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className}`} 
      style={containerStyle}
    >
      {useBigHeads ? (
        <div className={`w-full h-full ${fixedSize ? 'max-w-full max-h-full' : ''}`}>
          <BigHead 
            {...defaultProps} 
            {...(parsedProps || getSeedBasedProps())} 
          />
        </div>
      ) : (
        <Image
          src={imageUrl || undefined}
          path={imageUrl ? undefined : 'general/noAvatar.png'}
          alt={`${username}'s avatar`}
          w={width}
          h={height}
          tr={true}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;