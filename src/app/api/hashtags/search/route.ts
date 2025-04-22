// src/app/api/hashtags/search/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    
    if (!query) {
      return NextResponse.json(
        { error: "საძიებო ფრაზა აუცილებელია" },
        { status: 400 }
      );
    }
    
    // მოვაშოროთ # სიმბოლო, თუ არსებობს
    const cleanQuery = query.startsWith('#') ? query.substring(1) : query;
    
    // ჰეშთეგების ძიება
    const hashtags = await prisma.hashtag.findMany({
      where: {
        name: {
          contains: cleanQuery.toLowerCase(),
        },
      },
      take: 10,
      orderBy: {
        name: "asc",
      }
    });
    
    // პოსტების რაოდენობის ცალ-ცალკე მიღება თითოეული ჰეშთეგისთვის
    const hashtagsWithCounts = await Promise.all(
      hashtags.map(async (hashtag) => {
        const count = await prisma.postHashtag.count({
          where: { hashtagId: hashtag.id }
        });
        
        return {
          id: hashtag.id,
          name: hashtag.name,
          count
        };
      })
    );
    
    // დავალაგოთ პოპულარობის მიხედვით
    const sortedHashtags = hashtagsWithCounts.sort((a, b) => b.count - a.count);
    
    return NextResponse.json(sortedHashtags);
  } catch (error) {
    console.error("ჰეშთეგების ძიების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}