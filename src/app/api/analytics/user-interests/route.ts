// src/app/api/analytics/user-interests/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API რაუთი მომხმარებლის ინტერესების ანალიზისთვის
 * მოგვცემს მომხმარებლის აქტივობის ანალიზს და ტოპ ინტერესებს
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      );
    }
    
    // მომხმარებლის ინტერესების ანალიზი
    const interests = await analyzeUserInterests(userId);
    
    // მომხმარებლის პოსტების აქტივობის ანალიზი
    const postsActivity = await analyzePostsActivity(userId);
    
    // მომხმარებლის კონტენტის ანალიზი
    const contentAnalysis = await analyzeContent(userId);
    
    return NextResponse.json({
      interests,
      postsActivity,
      contentAnalysis
    });
  } catch (error) {
    console.error("ანალიზის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

/**
 * მომხმარებლის ინტერესების ანალიზი მისი აქტივობის მიხედვით
 */
async function analyzeUserInterests(userId: string) {
  // მომხმარებლის ყველა პოსტი
  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      hashtags: {
        include: {
          hashtag: true
        }
      }
    }
  });
  
  // მომხმარებლის ყველა მოწონებული პოსტი
  const likes = await prisma.like.findMany({
    where: { userId },
    include: {
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
  
  // მომხმარებლის ყველა კომენტარი
  const comments = await prisma.post.findMany({
    where: { 
      userId,
      parentPostId: { not: null } 
    },
    include: {
      parentPost: {
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
  
  // ჰეშთეგების სიხშირე
  const hashtagFrequency: Record<string, number> = {};
  
  // დავამატოთ საკუთარი პოსტებიდან
  posts.forEach(post => {
    post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 3; // უფრო მაღალი წონა
    });
  });
  
  // დავამატოთ მოწონებული პოსტებიდან
  likes.forEach(like => {
    like.post.hashtags.forEach(ph => {
      const hashtagName = ph.hashtag.name;
      hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 2;
    });
  });
  
  // დავამატოთ კომენტარებიდან
  comments.forEach(comment => {
    if (comment.parentPost) {
      comment.parentPost.hashtags.forEach(ph => {
        const hashtagName = ph.hashtag.name;
        hashtagFrequency[hashtagName] = (hashtagFrequency[hashtagName] || 0) + 1;
      });
    }
  });
  
  // დავახარისხოთ ჰეშთეგები სიხშირის მიხედვით
  const sortedHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name, frequency]) => ({ name, frequency }));
  
  // პროცენტული განაწილება
  let totalPoints = 0;
  sortedHashtags.forEach(item => {
    totalPoints += item.frequency;
  });
  
  const interestsWithPercentage = sortedHashtags.map(item => ({
    ...item,
    percentage: Math.round((item.frequency / totalPoints) * 100) || 0
  }));
  
  return {
    topInterests: interestsWithPercentage.slice(0, 5),
    allInterests: interestsWithPercentage
  };
}

/**
 * მომხმარებლის პოსტების აქტივობის ანალიზი
 */
async function analyzePostsActivity(userId: string) {
  // მომხმარებლის ყველა პოსტი
  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
          rePosts: true
        }
      }
    }
  });
  
  // აქტივობა დროის მიხედვით (ბოლო 30 დღე)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const postsLast30Days = posts.filter(post => 
    new Date(post.createdAt) >= thirtyDaysAgo
  );
  
  // ჯამური სტატისტიკა
  const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0);
  const totalComments = posts.reduce((sum, post) => sum + post._count.comments, 0);
  const totalReposts = posts.reduce((sum, post) => sum + post._count.rePosts, 0);
  
  // საშუალო ჩართულობა პოსტზე
  const avgEngagement = posts.length ? 
    (totalLikes + totalComments + totalReposts) / posts.length : 0;
  
  // ტოპ პოსტები ჩართულობის მიხედვით
  const topPosts = [...posts]
    .sort((a, b) => {
      const engagementA = a._count.likes + a._count.comments + a._count.rePosts;
      const engagementB = b._count.likes + b._count.comments + b._count.rePosts;
      return engagementB - engagementA;
    })
    .slice(0, 3)
    .map(post => ({
      id: post.id,
      desc: post.desc,
      likes: post._count.likes,
      comments: post._count.comments,
      reposts: post._count.rePosts,
      totalEngagement: post._count.likes + post._count.comments + post._count.rePosts,
      createdAt: post.createdAt
    }));
  
  return {
    totalPosts: posts.length,
    postsLast30Days: postsLast30Days.length,
    totalLikes,
    totalComments,
    totalReposts,
    avgEngagement,
    topPosts
  };
}

/**
 * მომხმარებლის კონტენტის ანალიზი
 */
async function analyzeContent(userId: string) {
  // მომხმარებლის პოსტები
  const posts = await prisma.post.findMany({
    where: { userId },
    select: {
      desc: true,
      img: true,
      video: true
    }
  });
  
  // მედია კონტენტის სტატისტიკა
  const postsWithImage = posts.filter(post => post.img).length;
  const postsWithVideo = posts.filter(post => post.video).length;
  const postsWithText = posts.filter(post => post.desc && post.desc.trim().length > 0).length;
  const postsTotal = posts.length;
  
  // პროცენტული მაჩვენებლები
  const imagePercentage = postsTotal ? Math.round((postsWithImage / postsTotal) * 100) : 0;
  const videoPercentage = postsTotal ? Math.round((postsWithVideo / postsTotal) * 100) : 0;
  const textPercentage = postsTotal ? Math.round((postsWithText / postsTotal) * 100) : 0;
  
  // ტექსტური კონტენტის ანალიზი
  const textLengths = posts
    .filter(post => post.desc)
    .map(post => post.desc?.length || 0);
  
  const avgTextLength = textLengths.length 
    ? textLengths.reduce((sum, len) => sum + len, 0) / textLengths.length 
    : 0;
  
  return {
    contentTypes: {
      image: { count: postsWithImage, percentage: imagePercentage },
      video: { count: postsWithVideo, percentage: videoPercentage },
      text: { count: postsWithText, percentage: textPercentage }
    },
    textAnalysis: {
      avgLength: Math.round(avgTextLength),
      shortPosts: textLengths.filter(len => len < 50).length,
      mediumPosts: textLengths.filter(len => len >= 50 && len < 100).length,
      longPosts: textLengths.filter(len => len >= 100).length,
    }
  };
}