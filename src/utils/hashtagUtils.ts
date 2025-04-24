// src/utils/hashtagUtils.ts
import { prisma } from "@/prisma";

/**
 * პოსტის ტექსტში ჰეშთეგების პოვნა
 * @param text პოსტის ტექსტი
 * @returns ნაპოვნი ჰეშთეგების მასივი (# სიმბოლოს გარეშე)
 */
export const extractHashtags = (text: string): string[] => {
  if (!text) return [];
  
  // რეგულარული გამოსახულება ჰეშთეგების ამოსაცნობად
  // უნდა დაიწყოს #-ით და გრძელდებოდეს ასოებით, ციფრებით ან ქართული სიმბოლოებით
  const hashtagRegex = /#([\wა-ჰ]+)/g;
  
  // ვიპოვოთ ყველა მატჩი და დავაბრუნოთ თეგები
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // ვამოწმებთ, რომ # სიმბოლოს შემდეგ მინიმუმ 1 სიმბოლო მაინც არის
  return matches
    .map(tag => tag.substring(1)) // ვაშორებთ # სიმბოლოს
    .filter(tag => tag.length > 0); // ვფილტრავთ ცარიელ თეგებს
};

/**
 * პოსტისთვის ჰეშთეგების შენახვა ბაზაში
 * @param postId პოსტის ID
 * @param hashtags ჰეშთეგების მასივი
 */
export const saveHashtags = async (postId: number, hashtags: string[]): Promise<void> => {
  if (!hashtags.length) return;

  // აქ ვამუშავებთ თითოეულ ჰეშთეგს
  await Promise.all(
    hashtags.map(async (tagName) => {
      // ვეძებთ ან ვქმნით ჰეშთეგს
      const hashtag = await prisma.hashtag.upsert({
        where: { name: tagName.toLowerCase() },
        update: {}, // არაფერი განახლდეს, თუ უკვე არსებობს
        create: { name: tagName.toLowerCase() },
      });

      // ვაკავშირებთ ჰეშთეგს პოსტთან
      await prisma.postHashtag.create({
        data: {
          postId,
          hashtagId: hashtag.id,
        },
      });
    })
  );
};

/**
 * პოსტის ტექსტის ფორმატირება, სადაც ჰეშთეგები არის ბმულები
 * @param text პოსტის ტექსტი
 * @returns დაფორმატებული HTML სტრინგი (JSX-ისთვის უნდა გარდაიქმნას)
 */
export const formatTextWithHashtags = (text: string): string => {
  if (!text) return '';
  
  // რეგულარული გამოსახულება ჰეშთეგების ამოსაცნობად
  const hashtagRegex = /#([\wა-ჰ]+)/g;
  
  // ჩავანაცვლოთ ჰეშთეგები HTML ბმულებით
  return text.replace(
    hashtagRegex,
    (match, tag) => `<a href="/hashtag/${tag.toLowerCase()}" class="text-iconBlue hover:underline">${match}</a>`
  );
};