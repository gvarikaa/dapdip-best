// src/app/api/hashtags/trending/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// კეშის ტიპი
type HashtagCache = {
  data: any;
  timestamp: number;
};

// გლობალური კეში
let hashtagCache: HashtagCache | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 წუთი

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      );
    }

    // შევამოწმოთ არის თუ არა კეში ჯერ კიდევ ვალიდური
    if (hashtagCache && Date.now() - hashtagCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(hashtagCache.data);
    }
    
    // მივიღოთ ყველა ჰეშთეგი
    const hashtags = await prisma.hashtag.findMany();
    
    // თითოეული ჰეშთეგისთვის დავითვალოთ პოსტების რაოდენობა
    const hashtagWithCounts = await Promise.all(
      hashtags.map(async (hashtag) => {
        // ბოლო 7 დღის მონაცემები უფრო რელევანტურია ტრენდებისთვის
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const totalCount = await prisma.postHashtag.count({
          where: { hashtagId: hashtag.id }
        });
        
        const recentCount = await prisma.postHashtag.count({
          where: { 
            hashtagId: hashtag.id,
            post: {
              createdAt: { gte: sevenDaysAgo }
            }
          }
        });
        
        // "ტრენდულობის" ქულა: ბოლო 7 დღის პოსტებს მეტი წონა აქვთ
        const trendScore = (recentCount * 3) + (totalCount - recentCount);
        
        return {
          id: hashtag.id,
          name: hashtag.name,
          count: totalCount,
          recentCount,
          trendScore
        };
      })
    );
    
    // დავფილტროთ ცარიელი ჰეშთეგები და დავალაგოთ ტრენდულობის მიხედვით
    const filteredHashtags = hashtagWithCounts
      .filter(hashtag => hashtag.count > 0)
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 5); // მხოლოდ ტოპ 5 ჰეშთეგი
    
    // მოვამზადოთ გასაგზავნი მონაცემები
    const result = filteredHashtags.map(hashtag => ({
      id: hashtag.id,
      name: hashtag.name,
      count: hashtag.count
    }));
    
    // განვაახლოთ კეში
    hashtagCache = {
      data: result,
      timestamp: Date.now()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("ტრენდული ჰეშთეგების მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}