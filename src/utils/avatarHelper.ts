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

// განსაზღვრეთ ტიპები ყველა შესაძლო არჩევანისთვის
type HairStyle = NonNullable<AvatarProps['hair']>;
type ClothingStyle = NonNullable<AvatarProps['clothing']>;
type EyeStyle = NonNullable<AvatarProps['eyes']>;

/**
 * განსაზღვრავს გენდერ-სპეციფიურ ოფციებს BigHeads ავატარებისთვის
 */
export const getGenderSpecificOptions = (gender?: string | null) => {
  // ნაგულისხმევად მამრობითი
  if (!gender || gender === 'male') {
    return {
      hairStyles: ['short', 'buzz', 'afro', 'bob', 'bald', 'balding', 'sides'] as HairStyle[],
      facialHairChance: 0.7, // 70% შანსი წვერის ქონისა
      clothingStyles: ['shirt', 'dressShirt', 'polo', 'jacket', 'hoodie'] as ClothingStyle[],
      eyeStyles: ['normal', 'squint', 'wink', 'happy', 'content', 'excited', 'simple'] as EyeStyle[]
    };
  }
  
  // მდედრობითი
  if (gender === 'female') {
    return {
      hairStyles: ['long', 'bun', 'pixie', 'bob', 'straight', 'curly'] as HairStyle[],
      facialHairChance: 0.01, // 1% შანსი წვერის ქონისა
      clothingStyles: ['dress', 'shirt', 'dressShirt', 'vneck', 'tankTop'] as ClothingStyle[],
      eyeStyles: ['normal', 'wink', 'happy', 'content', 'squint', 'simple'] as EyeStyle[]
    };
  }
  
  // არაბინარული ან სხვა
  return {
    hairStyles: ['short', 'buzz', 'afro', 'bob', 'long', 'bun', 'pixie'] as HairStyle[],
    facialHairChance: 0.3, // 30% შანსი წვერის ქონისა
    clothingStyles: ['shirt', 'dressShirt', 'vneck', 'polo', 'hoodie'] as ClothingStyle[],
    eyeStyles: ['normal', 'squint', 'wink', 'happy', 'content', 'simple'] as EyeStyle[]
  };
};

// სტაბილური შემთხვევითი მნიშვნელობის გენერაცია seed-ის ბაზაზე
export const getRandomOptions = (seed: string, gender?: string | null): AvatarProps => {
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
    accessory: getRandom(['none', 'roundGlasses', 'tinyGlasses', 'shades'] as AvatarProps['accessory'][], 3),
    body: gender === 'female' ? 'breasts' : 'chest',
    circleColor: getRandom(['blue', 'green', 'red', 'yellow'] as AvatarProps['circleColor'][], 5),
    clothing: getRandom(genderOptions.clothingStyles, 6),
    clothingColor: getRandom(['blue', 'green', 'red', 'white', 'black'] as AvatarProps['clothingColor'][], 7),
    eyebrows: getRandom(['raised', 'leftLowered', 'serious', 'angry', 'concerned'] as AvatarProps['eyebrows'][], 8),
    eyes: getRandom(genderOptions.eyeStyles, 9),
    faceMask: false,
    facialHair: hasFacialHair ? getRandom(['stubble', 'mediumBeard'] as AvatarProps['facialHair'][], 10) : 'none',
    graphic: getRandom(['none', 'react', 'graphQL', 'gatsby', 'vue'] as AvatarProps['graphic'][], 11),
    hair: hairStyle,
    hairColor: getRandom(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'] as AvatarProps['hairColor'][], 12),
    hat: getRandom(['none', 'none', 'none', 'beanie', 'turban'] as AvatarProps['hat'][], 13), // უმეტესწილად გამოიყენოს "none"
    hatColor: getRandom(['red', 'blue', 'green', 'white', 'black'] as AvatarProps['hatColor'][], 14),
    lashes: gender === 'female' ? true : randomFloat(0, 1, 15) > 0.5,
    lipColor: getRandom(['red', 'purple', 'pink', 'turqoise'] as AvatarProps['lipColor'][], 16),
    mask: false,
    mouth: getRandom(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue'] as AvatarProps['mouth'][], 17),
    skinTone: getRandom(['light', 'yellow', 'brown', 'dark', 'red', 'black'] as AvatarProps['skinTone'][], 18),
  };
};

// შემთხვევითი არჩევა მასივიდან
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ექსპორტირებული ფუნქცია შემთხვევითი პარამეტრების მისაღებად
export const generateRandomBigHeadOptions = (): AvatarProps => {
  // შემთხვევითი გენდერი
  const gender = randomChoice(['male', 'female', 'nonbinary']);
  const genderOptions = getGenderSpecificOptions(gender);
  
  // შემთხვევითი პარამეტრების გენერაცია
  return {
    accessory: randomChoice(['none', 'roundGlasses', 'tinyGlasses', 'shades'] as AvatarProps['accessory'][]),
    body: gender === 'female' ? 'breasts' : 'chest',
    circleColor: randomChoice(['blue', 'green', 'red', 'yellow'] as AvatarProps['circleColor'][]),
    clothing: randomChoice(genderOptions.clothingStyles),
    clothingColor: randomChoice(['blue', 'green', 'red', 'white', 'black'] as AvatarProps['clothingColor'][]),
    eyebrows: randomChoice(['raised', 'leftLowered', 'serious', 'angry', 'concerned'] as AvatarProps['eyebrows'][]),
    eyes: randomChoice(genderOptions.eyeStyles),
    faceMask: false,
    facialHair: Math.random() < genderOptions.facialHairChance ? randomChoice(['stubble', 'mediumBeard'] as AvatarProps['facialHair'][]) : 'none',
    graphic: randomChoice(['none', 'react', 'graphQL', 'gatsby', 'vue'] as AvatarProps['graphic'][]),
    hair: randomChoice(genderOptions.hairStyles),
    hairColor: randomChoice(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'] as AvatarProps['hairColor'][]),
    hat: Math.random() < 0.3 ? randomChoice(['beanie', 'turban'] as AvatarProps['hat'][]) : 'none',
    hatColor: randomChoice(['red', 'blue', 'green', 'white', 'black'] as AvatarProps['hatColor'][]),
    lashes: gender === 'female' ? true : Math.random() > 0.5,
    lipColor: randomChoice(['red', 'purple', 'pink', 'turqoise'] as AvatarProps['lipColor'][]),
    mask: false,
    mouth: randomChoice(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue'] as AvatarProps['mouth'][]),
    skinTone: randomChoice(['light', 'yellow', 'brown', 'dark', 'red', 'black'] as AvatarProps['skinTone'][]),
  };
};