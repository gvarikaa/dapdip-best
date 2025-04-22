"use client";

import React from 'react';
import * as BigHeadsCore from '@bigheads/core';

type SimpleBigHeadProps = {
  avatarProps: any;
  className?: string;
};

const SimpleBigHead: React.FC<SimpleBigHeadProps> = ({ avatarProps, className = '' }) => {
  // საწყისი პარამეტრები
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

  // გავაერთიანოთ საწყისი პარამეტრები და გადმოცემული პარამეტრები
  const mergedProps = { ...defaultProps, ...avatarProps };

  // ვლოგავთ პროპებს დებაგინგისთვის
  console.log("SimpleBigHead props:", { avatarProps, mergedProps });

  return (
    <div className={className}>
      <BigHeadsCore.BigHead {...mergedProps} />
    </div>
  );
};

export default SimpleBigHead;