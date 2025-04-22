// src/components/SimpleBigHead.tsx
"use client";

import React from 'react';
import { BigHead } from '@bigheads/core';

// მარტივი პროპები მხოლოდ აუცილებელი ველებით
type SimpleBigHeadProps = {
  avatarProps: any;
  className?: string;
};

const SimpleBigHead: React.FC<SimpleBigHeadProps> = ({ avatarProps, className = '' }) => {
  // აუცილებელი პროპები, რომ თავიდან ავიცილოთ შეცდომები
  const defaultProps = {
    accessory: 'none',
    body: 'chest',
    circleColor: 'blue',
    clothing: 'shirt',
    clothingColor: 'blue',
    eyebrows: 'raised',
    eyes: 'normal',
    facialHair: 'none',
    graphic: 'none',
    hair: 'short',
    hairColor: 'black',
    hat: 'none',
    hatColor: 'red',
    lashes: false,
    lipColor: 'red',
    mouth: 'serious',
    skinTone: 'light',
  };

  // შევურიოთ აუცილებელი და გადმოცემული პროპები
  const mergedProps = { ...defaultProps, ...avatarProps };

  return (
    <div className={className}>
      <BigHead {...mergedProps} />
    </div>
  );
};

export default SimpleBigHead;