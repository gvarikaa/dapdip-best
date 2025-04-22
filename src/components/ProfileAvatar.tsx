// src/components/ProfileAvatar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from "./Image";
import BigHeadsAvatar from './BigHeadsAvatar';
import { shouldUseBigHeads } from '@/utils/avatarHelper';

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  username: string;
  gender?: string | null | undefined;
  avatarProps?: string | null | undefined; // დაამატეთ ეს პარამეტრი
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
  
  // ცდილობს JSON-ის პარსინგს
  useEffect(() => {
    if (avatarProps) {
      try {
        const parsed = JSON.parse(avatarProps);
        setParsedProps(parsed);
        console.log("Successfully parsed avatarProps:", parsed);
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
  
  // დებაგინგისთვის
  console.log("ProfileAvatar render:", {
    username,
    imageUrl,
    gender,
    hasAvatarProps: !!avatarProps,
    avatarPropsLength: avatarProps?.length,
    parsedProps: !!parsedProps,
    useBigHeads
  });
  
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width, height: width }}>
      {useBigHeads ? (
        parsedProps ? (
          // ავატარის პარამეტრებით
          <BigHeadsAvatar 
            seed={username}
            gender={gender || undefined}
            avatarProps={parsedProps} // გადავცეთ პარსირებული პარამეტრები
            size={width}
          />
        ) : (
          // გენერირებული seed-ის საფუძველზე
          <BigHeadsAvatar 
            seed={username}
            gender={gender || undefined}
            size={width}
          />
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