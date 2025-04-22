// src/utils/recommendationModel.ts

/**
 * მარტივი რეკომენდაციების მოდელი რომელიც იყენებს კოსინუსის მსგავსებას
 * ინტერესების ვექტორებზე დაყრდნობით
 */

/**
 * ფუნქცია, რომელიც ქმნის მომხმარებლის ინტერესების ვექტორს
 * @param userInterests მომხმარებლის ინტერესების მასივი
 * @param allHashtags ყველა შესაძლო ჰეშთეგის მასივი
 */
export function createUserVector(userInterests: string[], allHashtags: string[]): Record<string, number> {
  // შევქმნათ ვექტორი, სადაც ყველა შესაძლო ჰეშთეგისთვის მნიშვნელობა არის 0
  const vector: Record<string, number> = {};
  allHashtags.forEach(tag => {
    vector[tag] = 0;
  });
  
  // დავამატოთ 1 იმ ჰეშთეგებისთვის, რომლებიც მომხმარებელს აინტერესებს
  userInterests.forEach(interest => {
    if (vector.hasOwnProperty(interest)) {
      vector[interest] = 1;
    }
  });
  
  return vector;
}

/**
 * ფუნქცია, რომელიც ითვლის კოსინუსის მსგავსებას ორ ვექტორს შორის
 * @param vecA პირველი ვექტორი
 * @param vecB მეორე ვექტორი
 */
export function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  const allTags = Object.keys(vecA);
  
  // დავითვალოთ ვექტორების სკალარული ნამრავლი
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  allTags.forEach(tag => {
    dotProduct += vecA[tag] * vecB[tag];
    normA += vecA[tag] ** 2;
    normB += vecB[tag] ** 2;
  });
  
  // დავითვალოთ ვექტორების ნორმები
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  // დავითვალოთ კოსინუსის მსგავსება
  // თუ ერთ-ერთი ვექტორი ნულოვანია, მსგავსება არის 0
  return (normA && normB) ? dotProduct / (normA * normB) : 0;
}

/**
 * ფუნქცია, რომელიც ითვლის მსგავსების წონას ორ მომხმარებელს შორის
 * ინტერესების მიხედვით
 * @param userAInterests პირველი მომხმარებლის ინტერესები
 * @param userBInterests მეორე მომხმარებლის ინტერესები
 * @param allHashtags ყველა შესაძლო ჰეშთეგის მასივი
 */
export function getUserSimilarity(
  userAInterests: string[], 
  userBInterests: string[], 
  allHashtags: string[]
): number {
  const vectorA = createUserVector(userAInterests, allHashtags);
  const vectorB = createUserVector(userBInterests, allHashtags);
  
  return cosineSimilarity(vectorA, vectorB);
}

/**
 * ფუნქცია, რომელიც ითვლის მსგავსების წონას მომხმარებელსა და პოსტს შორის
 * @param userInterests მომხმარებლის ინტერესები
 * @param postHashtags პოსტის ჰეშთეგები
 * @param allHashtags ყველა შესაძლო ჰეშთეგის მასივი
 */
export function getPostSimilarity(
  userInterests: string[],
  postHashtags: string[],
  allHashtags: string[]
): number {
  const userVector = createUserVector(userInterests, allHashtags);
  const postVector = createUserVector(postHashtags, allHashtags);
  
  return cosineSimilarity(userVector, postVector);
}

/**
 * ფუნქცია, რომელიც პოულობს დაყენებული ქულებით რეკომენდაციებს
 * @param items რეკომენდაციისთვის ელემენტების მასივი
 * @param similarities ელემენტების მსგავსების ქულების მასივი
 * @param limit რეკომენდაციების რაოდენობა
 */
export function getTopRecommendations<T>(
  items: T[],
  similarities: number[],
  limit: number = 5
): T[] {
  // შევქმნათ მასივი, რომელიც შეიცავს ელემენტებსა და მათ ქულებს
  const itemsWithScores = items.map((item, index) => ({
    item,
    score: similarities[index]
  }));
  
  // დავალაგოთ ელემენტები ქულების მიხედვით (დაღმავალი)
  const sorted = itemsWithScores.sort((a, b) => b.score - a.score);
  
  // დავაბრუნოთ ტოპ N რეკომენდაცია
  return sorted.slice(0, limit).map(item => item.item);
}

/**
 * ფუნქცია მსგავსი ჰეშთეგების მოსაძებნად
 * @param targetHashtag სამიზნე ჰეშთეგი
 * @param allHashtags ყველა ჰეშთეგის მასივი მათი გამოყენების სიხშირით
 */
export function getSimilarHashtags(
  targetHashtag: string,
  allHashtagsWithFrequency: Array<{name: string, frequency: number}>,
  limit: number = 3
): string[] {
  // აქ შეგვიძლია განვავრცოთ ალგორითმი მომავალში,
  // ჯერ კი დავაბრუნოთ უბრალოდ ყველაზე პოპულარული ჰეშთეგები
  return allHashtagsWithFrequency
    .sort((a, b) => b.frequency - a.frequency)
    .filter(h => h.name !== targetHashtag)
    .slice(0, limit)
    .map(h => h.name);
}