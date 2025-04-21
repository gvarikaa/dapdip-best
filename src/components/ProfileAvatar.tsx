"use client";

import React from 'react';
import Image from "./Image";
import BigHeadsAvatar from './BigHeadsAvatar';
import { shouldUseBigHeads, generateAvatarSeed } from '@/utils/avatarHelper';

type ProfileAvatarProps = {
  imageUrl: string | null | undefined;
  username: string;
  gender?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * პროფილის ავატარის კომპონენტი - ავტომატურად იყენებს BigHeads
 * როცა მომხმარებელს არ აქვს ატვირთული სურათი
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  username,
  gender,
  size = 'md',
  className = '',
}) => {
  // ზომების კონფიგურაცია
  const sizeConfig = {
    sm: { width: 40, height: 40 },
    md: { width: 100, height: 100 },
    lg: { width: 200, height: 200 },
  };
  
  const { width } = sizeConfig[size];
  const useBigHeads = shouldUseBigHeads(imageUrl);
  
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width, height: width }}>
      {useBigHeads ? (
        <BigHeadsAvatar 
          seed={generateAvatarSeed(username)} 
          gender={gender}
          size={width}
        />
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