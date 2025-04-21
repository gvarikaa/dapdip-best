// src/utils/avatarHelper.ts
import { AvatarProps } from '@bigheads/core';

/**
 * ამოწმებს საჭიროა თუ არა BigHeads-ის გამოყენება
 * @param imageUrl მომხმარებლის სურათის URL
 * @returns true თუ უნდა გამოიყენოს BigHeads
 */
export const shouldUseBigHeads = (imageUrl: string | null | undefined): boolean => {
  // თუ imageUrl არის ცარიელი, null ან undefined, გამოვიყენოთ BigHeads
  return !imageUrl;
};

/**
 * გენერირებს სტაბილურ seed-ს BigHeads-ისთვის
 * @param username მომხმარებლის სახელი
 * @returns დაგენერირებული seed
 */
export const generateAvatarSeed = (username: string): string => {
  // მარტივად დავაბრუნოთ username, რაც უზრუნველყოფს
  // ერთი და იგივე მომხმარებლისთვის ერთი და იგივე ავატარის გენერაციას
  return username;
};

/**
 * განსაზღვრავს გენდერ-სპეციფიურ ოფციებს BigHeads ავატარებისთვის
 */
export const getGenderSpecificOptions = (gender?: string) => {
  // ნაგულისხმევად მამრობითი
  if (!gender || gender === 'male') {
    return {
      hairStyles: ['short', 'buzz', 'afro', 'bob', 'bald', 'balding', 'sides'] as AvatarProps['hair'][],
      facialHairChance: 0.7, // 70% შანსი წვერის ქონისა
      clothingStyles: ['shirt', 'dressShirt', 'polo', 'jacket', 'hoodie'] as AvatarProps['clothing'][],
      eyeStyles: ['normal', 'squint', 'wink', 'happy', 'content', 'excited', 'simple'] as AvatarProps['eyes'][]
    };
  }
  
  // მდედრობითი
  if (gender === 'female') {
    return {
      hairStyles: ['long', 'bun', 'pixie', 'bob', 'straight', 'curly', 'bob'] as AvatarProps['hair'][],
      facialHairChance: 0.01, // 1% შანსი წვერის ქონისა
      clothingStyles: ['dress', 'shirt', 'dressShirt', 'vneck', 'tankTop'] as AvatarProps['clothing'][],
      eyeStyles: ['normal', 'wink', 'happy', 'content', 'squint', 'simple'] as AvatarProps['eyes'][]
    };
  }
  
  // არაბინარული ან სხვა
  return {
    hairStyles: ['short', 'buzz', 'afro', 'bob', 'long', 'bun', 'pixie', 'bob'] as AvatarProps['hair'][],
    facialHairChance: 0.3, // 30% შანსი წვერის ქონისა
    clothingStyles: ['shirt', 'dressShirt', 'vneck', 'polo', 'hoodie'] as AvatarProps['clothing'][],
    eyeStyles: ['normal', 'squint', 'wink', 'happy', 'content', 'simple'] as AvatarProps['eyes'][]
  };
};

// სტაბილური შემთხვევითი მნიშვნელობის გენერაცია seed-ის ბაზაზე
export const getRandomOptions = (seed: string, gender?: string): AvatarProps => {
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
  const getRandom = <T>(arr: T[], seedOffset = 0): T => {
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
  
  // მკაცრად ტიპიზირებული პარამეტრების შერჩევა
  return {
    accessory: getRandom(['none', 'roundGlasses', 'tinyGlasses', 'shades'], 3) as AvatarProps['accessory'],
    body: gender === 'female' ? 'breasts' : 'chest',
    circleColor: getRandom(['blue', 'green', 'red', 'yellow'], 5) as AvatarProps['circleColor'],
    clothing: getRandom(genderOptions.clothingStyles, 6),
    clothingColor: getRandom(['blue', 'green', 'red', 'white', 'black'], 7) as AvatarProps['clothingColor'],
    eyebrows: getRandom(['raised', 'leftLowered', 'serious', 'angry', 'concerned'], 8) as AvatarProps['eyebrows'],
    eyes: getRandom(genderOptions.eyeStyles, 9),
    faceMask: false,
    facialHair: hasFacialHair ? getRandom(['stubble', 'mediumBeard'], 10) as AvatarProps['facialHair'] : 'none',
    graphic: getRandom(['none', 'react', 'graphQL', 'gatsby', 'vue'], 11) as AvatarProps['graphic'],
    hair: hairStyle,
    hairColor: getRandom(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'], 12) as AvatarProps['hairColor'],
    hat: getRandom(['none', 'none', 'none', 'beanie', 'turban'], 13) as AvatarProps['hat'], // უმეტესწილად გამოიყენოს "none"
    hatColor: getRandom(['red', 'blue', 'green', 'white', 'black'], 14) as AvatarProps['hatColor'],
    lashes: gender === 'female' ? true : randomFloat(0, 1, 15) > 0.5,
    lipColor: getRandom(['red', 'purple', 'pink', 'turqoise'], 16) as AvatarProps['lipColor'],
    mask: false,
    mouth: getRandom(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue'], 17) as AvatarProps['mouth'],
    skinTone: getRandom(['light', 'yellow', 'brown', 'dark', 'red', 'black'], 18) as AvatarProps['skinTone'],
  };
};

// ექსპორტირებული ფუნქცია შემთხვევითი პარამეტრების მისაღებად
export const generateRandomBigHeadOptions = (): AvatarProps => {
  const randomChoice = <T extends string>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  // შემთხვევითი გენდერი
  const gender = randomChoice(['male', 'female', 'nonbinary']);
  const genderOptions = getGenderSpecificOptions(gender);
  
  // შემთხვევითი პარამეტრების გენერაცია
  return {
    accessory: randomChoice(['none', 'roundGlasses', 'tinyGlasses', 'shades']) as AvatarProps['accessory'],
    body: gender === 'female' ? 'breasts' : 'chest',
    circleColor: randomChoice(['blue', 'green', 'red', 'yellow']) as AvatarProps['circleColor'],
    clothing: randomChoice(genderOptions.clothingStyles),
    clothingColor: randomChoice(['blue', 'green', 'red', 'white', 'black']) as AvatarProps['clothingColor'],
    eyebrows: randomChoice(['raised', 'leftLowered', 'serious', 'angry', 'concerned']) as AvatarProps['eyebrows'],
    eyes: randomChoice(genderOptions.eyeStyles),
    faceMask: false,
    facialHair: Math.random() < genderOptions.facialHairChance ? randomChoice(['stubble', 'mediumBeard']) as AvatarProps['facialHair'] : 'none',
    graphic: randomChoice(['none', 'react', 'graphQL', 'gatsby', 'vue']) as AvatarProps['graphic'],
    hair: randomChoice(genderOptions.hairStyles),
    hairColor: randomChoice(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink']) as AvatarProps['hairColor'],
    hat: Math.random() < 0.3 ? randomChoice(['beanie', 'turban']) as AvatarProps['hat'] : 'none',
    hatColor: randomChoice(['red', 'blue', 'green', 'white', 'black']) as AvatarProps['hatColor'],
    lashes: gender === 'female' ? true : Math.random() > 0.5,
    lipColor: randomChoice(['red', 'purple', 'pink', 'turqoise']) as AvatarProps['lipColor'],
    mask: false,
    mouth: randomChoice(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue']) as AvatarProps['mouth'],
    skinTone: randomChoice(['light', 'yellow', 'brown', 'dark', 'red', 'black']) as AvatarProps['skinTone'],
  };
};