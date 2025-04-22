// src/app/api/recommendations/personalized/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// კეშის ტიპი
type RecommendationCache = {
  data: any;
  timestamp: number;
};

// გლობალური კეში
let recommendationCache: Map<string, RecommendationCache> = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 წუთი

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      );
    }
    
    // შევამოწმოთ არის თუ არა კეში ჯერ კიდევ ვალიდური ამ მომხმარებლისთვის
    const userCache = recommendationCache.get(userId);
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(userCache.data);
    }
    
    // მივიღოთ მომხმარებლის არსებული ინტერესები (მის მიერ გამოყენებული ჰეშთეგები)
    const userHashtags = await getUserInterests(userId);
    
    // მივიღოთ პოსტები, რომლებიც მომხმარებელს შეიძლება აინტერესებდეს
    const recommendedPosts = await getRecommendedPosts(userId, userHashtags);
    
    // მივიღოთ მომხმარებლები, რომლებიც შეიძლება საინტერესოები იყვნენ ამ მომხმარებლისთვის
    const recommendedUsers = await getRecommendedUsers(userId, userHashtags);
    
    // მივიღოთ ჰეშთეგები, რომლებიც მსგავსია მომხმარებლის ინტერესებისა
    const recommendedHashtags = await getRecommendedHashtags(userId, userHashtags);
    
    // მოვამზადოთ გასაგზავნი მონაცემები
    const result = {
      posts: recommendedPosts,
      users: recommendedUsers,
      hashtags: recommendedHashtags
    };
    
    // განვაახლოთ კეში
    recommendationCache.set(userId, {
      data: result,
      timestamp: Date.now()
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("რეკომენდაციების მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ფუნქცია მომხმარებლის ინტერესების მისაღებად (ჰეშთეგები)
async function getUserInterests(userId: string) {
  // ვიპოვოთ მომხმარებლის მიერ გამოყენებული ჰეშთეგები
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
  
  // ვიპოვოთ მომხმარებლის მიერ მოწონებული პოსტების ჰეშთეგები
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
  
  // ვიპოვოთ ყველა ჰეშთეგი და დავითვალოთ მათი სიხშირე
  const hashtagFrequency: Record<string, number> = {};
  
  // დავამატოთ საკუთარი პოსტებიდან
  userPosts.forEach(post => {
    post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 1;
    });
  });
  
  // დავამატოთ მოწონებული პოსტებიდან
  likedPosts.forEach(like => {
    like.post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 1;
    });
  });
  
  // დავახარისხოთ ჰეშთეგები სიხშირის მიხედვით
  const sortedHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  
  return sortedHashtags;
}

// ფუნქცია პოსტების რეკომენდაციისთვის
async function getRecommendedPosts(userId: string, userInterests: string[]) {
  // მომხმარებლის მიერ უკვე ნანახი პოსტები
  const userActivity = await prisma.like.findMany({
    where: { userId },
    select: { postId: true }
  });
  
  const viewedPostIds = new Set(userActivity.map(a => a.postId));
  
  // თუ არ გვაქვს საკმარისი ინტერესები, დავაბრუნოთ პოპულარული პოსტები
  if (userInterests.length === 0) {
    return await prisma.post.findMany({
      where: {
        id: { notIn: Array.from(viewedPostIds) },
        parentPostId: null
      },
      orderBy: {
        likes: { _count: 'desc' }
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            img: true
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });
  }
  
  // მოვძებნოთ პოსტები მომხმარებლის ინტერესების მიხედვით
  const recommendedPosts = await prisma.post.findMany({
    where: {
      id: { notIn: Array.from(viewedPostIds) },
      parentPostId: null,
      hashtags: {
        some: {
          hashtag: {
            name: { in: userInterests }
          }
        }
      }
    },
    orderBy: [
      { createdAt: 'desc' },
      { likes: { _count: 'desc' } }
    ],
    take: 5,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          img: true
        }
      },
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });
  
  return recommendedPosts;
}

// ფუნქცია მომხმარებლების რეკომენდაციისთვის
async function getRecommendedUsers(userId: string, userInterests: string[]) {
  // მომხმარებლები, რომლებსაც უკვე ადევნებს თვალს ეს მომხმარებელი
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  
  const followingIds = following.map(f => f.followingId);
  
  // თუ არ გვაქვს საკმარისი ინტერესები, დავაბრუნოთ პოპულარული მომხმარებლები
  if (userInterests.length === 0) {
    return await prisma.user.findMany({
      where: {
        id: { notIn: [...followingIds, userId] }
      },
      orderBy: {
        followers: { _count: 'desc' }
      },
      take: 3,
      select: {
        id: true,
        displayName: true,
        username: true,
        img: true,
        bio: true
      }
    });
  }
  
  // მოვძებნოთ მომხმარებლები, რომლებიც წერენ მსგავს თემებზე
  const usersWithSimilarInterests = await prisma.user.findMany({
    where: {
      id: { notIn: [...followingIds, userId] },
      posts: {
        some: {
          hashtags: {
            some: {
              hashtag: {
                name: { in: userInterests }
              }
            }
          }
        }
      }
    },
    orderBy: [
      { followers: { _count: 'desc' } },
      { posts: { _count: 'desc' } }
    ],
    take: 3,
    select: {
      id: true,
      displayName: true,
      username: true,
      img: true,
      bio: true,
      gender: true,
      avatarProps: true
    }
  });
  
  return usersWithSimilarInterests;
}

// ფუნქცია ჰეშთეგების რეკომენდაციისთვის
async function getRecommendedHashtags(userId: string, userInterests: string[]) {
  // თუ არ გვაქვს საკმარისი ინტერესები, დავაბრუნოთ პოპულარული ჰეშთეგები
  if (userInterests.length === 0) {
    return await prisma.hashtag.findMany({
      orderBy: {
        posts: { _count: 'desc' }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true }
        }
      }
    });
  }
  
  // ვიპოვოთ ჰეშთეგები, რომლებიც ხშირად გვხვდება მომხმარებლის ინტერესებთან ერთად
  const relatedHashtags = await prisma.hashtag.findMany({
    where: {
      name: { notIn: userInterests },
      posts: {
        some: {
          post: {
            hashtags: {
              some: {
                hashtag: {
                  name: { in: userInterests }
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      posts: { _count: 'desc' }
    },
    take: 5,
    select: {
      id: true,
      name: true,
      _count: {
        select: { posts: true }
      }
    }
  });
  
  return relatedHashtags;
}