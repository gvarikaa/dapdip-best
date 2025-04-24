// src/components/Background/ProfileCover.tsx
"use client";

import React from 'react';
import Image from "../Image";
import CoolBackground from "./CoolBackground";

type ProfileCoverProps = {
  username: string;
  coverUrl?: string | null;
  className?: string;
};

const ProfileCover: React.FC<ProfileCoverProps> = ({ 
  username, 
  coverUrl, 
  className = '' 
}) => {
  // ფონის ტიპი, რომელიც განისაზღვრება მომხმარებლის სახელით
  const backgroundTypes = ['gradient', 'triangles', 'particles', 'waves'] as const;
  const charSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const backgroundType = backgroundTypes[charSum % backgroundTypes.length];
  
  if (coverUrl) {
    return (
      <div className={`w-full aspect-[3/1] bg-cover bg-center ${className}`}>
        <Image
          path={coverUrl}
          alt={`${username}'s cover`}
          w={600}
          h={200}
          tr={true}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  return (
    <div className={`w-full aspect-[3/1] ${className}`}>
      <CoolBackground 
        username={username} 
        type={backgroundType as any}
        className="w-full h-full"
      />
    </div>
  );
};

export default ProfileCover;