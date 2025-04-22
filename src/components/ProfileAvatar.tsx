// src/components/ProfileAvatar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from "./Image";
import dynamic from 'next/dynamic';
import { shouldUseBigHeads } from '@/utils/avatarHelper';
import { AvatarProps } from '@bigheads/core';

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
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  username,
  gender,
  avatarProps,
  size = 'md',
  className = '',
}) => {
  const [parsedProps, setParsedProps] = useState<any>(null);
  
  // ვცდილობთ JSON-ის პარსინგს
  useEffect(() => {
    if (avatarProps) {
      try {
        const parsed = JSON.parse(avatarProps);
        setParsedProps(parsed);
      } catch (e) {
        console.error("Error parsing avatarProps JSON:", e);
      }
    }
  }, [avatarProps]);
  
  // ზომების კონფიგურაცია
  const sizeConfig = {
    sm: { width: 40, height: 40 },
    md: { width: 100, height: 100 },
    lg: { width: 200, height: 200 },
  };
  
  const { width } = sizeConfig[size];
  const useBigHeads = shouldUseBigHeads(imageUrl);
  
  // საწყისი პარამეტრები BigHead-ისთვის წინასწარ განსაზღვრული ტიპებით
  const defaultProps: AvatarProps = {
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

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width, height: width }}>
      {useBigHeads ? (
        parsedProps ? (
          <div className="w-full h-full">
            <BigHead {...defaultProps} {...parsedProps} />
          </div>
        ) : (
          <div className="w-full h-full">
            <BigHead {...defaultProps} />
          </div>
        )
      ) : (
        <Image
          src={imageUrl || undefined}
          path={imageUrl ? undefined : 'general/noAvatar.png'}
          alt={`${username}'s avatar`}
          w={width}
          h={width}
          tr={true}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;