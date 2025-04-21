"use client";

import React, { useMemo } from 'react';
import { BigHead } from '@bigheads/core';
import { getGenderSpecificOptions } from '@/utils/avatarHelper';

// პარამეტრები BigHeads ავატარის რენდერინგისთვის
type BigHeadsProps = {
  seed: string;
  gender?: string;
  size?: number;
  className?: string;
};

// სტაბილური შემთხვევითი მნიშვნელობის გენერაცია seed-ის ბაზაზე
const getRandomOptions = (seed: string, gender?: string) => {
  // Seed-დან ვქმნით პსევდო-შემთხვევით რიცხვებს
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // 32-ბიტიან მთელ რიცხვად გარდაქმნა
    }
    return hash;
  };

  const seedNum = hashCode(seed);
  const getRandom = (arr: any[], seedOffset = 0) => {
    const n = Math.abs(seedNum + seedOffset) % arr.length;
    return arr[n];
  };

  const randomFloat = (min: number, max: number, seedOffset = 0) => {
    const rand = Math.abs(Math.sin(seedNum + seedOffset)) * 10000;
    return ((rand - Math.floor(rand)) * (max - min)) + min;
  };

  // გენდერ-სპეციფიური ოფციების მიღება
  const genderOptions = getGenderSpecificOptions(gender);
  
  // თმის სტილი გენდერის მიხედვით
  const hairStyle = getRandom(genderOptions.hairStyles, 1);
  
  // წვერის ქონა-არ ქონა გენდერის მიხედვით
  const hasFacialHair = randomFloat(0, 1, 2) < genderOptions.facialHairChance;
  
  // პარამეტრების შერჩევა
  return {
    accessory: getRandom(['none', 'roundGlasses', 'tinyGlasses', 'shades'], 3),
    body: getRandom(['chest', 'breasts'], 4),
    circleColor: getRandom(['blue', 'green', 'red', 'yellow'], 5),
    clothing: getRandom(genderOptions.clothingStyles, 6),
    clothingColor: getRandom(['blue', 'green', 'red', 'white', 'black'], 7),
    eyebrows: getRandom(['raised', 'leftLowered', 'serious', 'angry', 'concerned'], 8),
    eyes: getRandom(genderOptions.eyeStyles, 9),
    facialHair: hasFacialHair ? getRandom(['none', 'stubble', 'mediumBeard'], 10) : 'none',
    graphic: getRandom(['none', 'react', 'graphQL', 'gatsby', 'vue', 'redwood'], 11),
    hair: hairStyle,
    hairColor: getRandom(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'], 12),
    hat: getRandom(['none', 'none', 'none', 'beanie', 'turban'], 13), // უმეტესწილად გამოიყენოს "none"
    hatColor: getRandom(['red', 'blue', 'green', 'white', 'black'], 14),
    lashes: gender === 'female' ? true : randomFloat(0, 1, 15) > 0.5,
    lipColor: getRandom(['red', 'purple', 'pink', 'turqoise'], 16),
    mask: false,
    faceMask: false,
    mouth: getRandom(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue'], 17),
    skinTone: getRandom(['light', 'yellow', 'brown', 'dark', 'red', 'black'], 18),
  };
};

const BigHeadsAvatar: React.FC<BigHeadsProps> = ({
  seed,
  gender,
  size = 100,
  className = '',
}) => {
  // ვიყენებთ useMemo, რომ პარამეტრები თავიდან არ გადაითვალოს ყოველ რენდერზე
  const avatarOptions = useMemo(() => getRandomOptions(seed, gender), [seed, gender]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <BigHead {...avatarOptions} />
    </div>
  );
};

export default BigHeadsAvatar;