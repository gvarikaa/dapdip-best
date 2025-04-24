// src/utils/recommendationUtils.ts
import { prisma } from "@/prisma";

/**
 * მომხმარებლის ინტერესების მისაღებად ფუნქცია, მისი აქტივობის ანალიზის საფუძველზე
 * @param userId მომხმარებლის ID
 * @returns ინტერესების მასივი (ჰეშთეგები სიხშირის მიხედვით)
 */
export async function getUserInterests(userId: string): Promise<string[]> {
  // მომხმარებლის პოსტები
  const userPosts = await prisma.post.findMany({
    where: { userId },
    include: {
      hashtags: {
        include: {
          hashtag: true
        }
      }
    }
  });
  
  // მომხმარებლის მოწონებული პოსტები
  const likedPosts = await prisma.like.findMany({
    where: { userId },
    select: {
      post: {
        include: {
          hashtags: {
            include: {
              hashtag: true
            }
          }
        }
      }
    }
  });

  // შევინახოთ ჰეშთეგები და მათი სიხშირე
  const hashtagFrequency: Record<string, number> = {};
  
  // მომხმარებლის პოსტებიდან
  userPosts.forEach(post => {
    post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 3; // მაღალი წონა
    });
  });
  
  // მოწონებული პოსტებიდან
  likedPosts.forEach(like => {
    like.post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 2; // საშუალო წონა
    });
  });
  
  // თუ ინტერესები ცარიელია, ვცადოთ გამოვიყენოთ პოპულარული ჰეშთეგები
  if (Object.keys(hashtagFrequency).length === 0) {
    const popularHashtags = await prisma.hashtag.findMany({
      orderBy: {
        posts: { _count: 'desc' }
      },
      take: 5
    });
    
    return popularHashtags.map(h => h.name);
  }
  
  // დავალაგოთ ჰეშთეგები სიხშირის მიხედვით
  const sortedHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  
  return sortedHashtags;
}

/**
 * ჰეშთეგების მსგავსების დადგენა კონტენტზე დაფუძნებული მიდგომით
 * @param tagName ჰეშთეგის სახელი
 * @returns მსგავსი ჰეშთეგების მასივი
 */
export async function getSimilarHashtags(tagName: string): Promise<string[]> {
  // ვიპოვოთ პოსტები, რომლებშიც გამოყენებულია ეს ჰეშთეგი
  const postsWithTag = await prisma.postHashtag.findMany({
    where: {
      hashtag: {
        name: tagName
      }
    },
    select: {
      postId: true
    }
  });
  
  const postIds = postsWithTag.map(p => p.postId);
  
  // ვიპოვოთ ამ პოსტებში გამოყენებული სხვა ჰეშთეგები
  const relatedHashtags = await prisma.postHashtag.findMany({
    where: {
      postId: { in: postIds },
      hashtag: {
        name: { not: tagName }
      }
    },
    include: {
      hashtag: true
    }
  });
  
  // დავითვალოთ თითოეული ჰეშთეგის სიხშირე
  const hashtagFrequency: Record<string, number> = {};
  
  relatedHashtags.forEach(ph => {
    const name = ph.hashtag.name;
    hashtagFrequency[name] = (hashtagFrequency[name] || 0) + 1;
  });
  
  // დავალაგოთ სიხშირის მიხედვით
  const sortedHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  
  return sortedHashtags.slice(0, 10); // დავაბრუნოთ ტოპ 10
}