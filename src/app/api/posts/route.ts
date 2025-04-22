import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const userProfileId = searchParams.get("user");
  const page = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  
  // API-დან მიღებული ან ნაგულისხმევი ლიმიტი
  const LIMIT = limitParam ? parseInt(limitParam) : 15;

  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });
  }

  try {
    // დავამოწმოთ არის თუ არა მომხმარებელი followings-ში
    const followings = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    // პირობა posts მოსაძებნად
    let whereCondition;
    
    if (userProfileId !== "undefined") {
      // მომხმარებლის პროფილზე
      whereCondition = { parentPostId: null, userId: userProfileId as string };
    } else if (followings.length > 0) {
      // მომხმარებელს ჰყავს followers
      whereCondition = {
        parentPostId: null,
        userId: {
          in: [
            userId,
            ...followings.map((follow) => follow.followingId),
          ],
        },
      };
    } else {
      // ახალი მომხმარებლისთვის: ყველა პოსტი
      whereCondition = {
        parentPostId: null,
      };
    }

    const postIncludeQuery = {
      user: { 
        select: { 
          displayName: true, 
          username: true, 
          img: true,
          gender: true,        // დამატებული ველი
          avatarProps: true    // დამატებული ველი
        } 
      },
      _count: { select: { likes: true, rePosts: true, comments: true } },
      likes: { where: { userId: userId }, select: { id: true } },
      rePosts: { where: { userId: userId }, select: { id: true } },
      saves: { where: { userId: userId }, select: { id: true } },
    };

    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        rePost: {
          include: postIncludeQuery,
        },
        ...postIncludeQuery,
      },
      take: LIMIT,
      skip: (Number(page) - 1) * LIMIT,
      orderBy: { createdAt: "desc" }
    });

    const totalPosts = await prisma.post.count({ where: whereCondition });

    const hasMore = Number(page) * LIMIT < totalPosts;

    // დავამატოთ მონაცემები დებაგისთვის
    console.log(`პოსტების მოძებნა: ${posts.length} პოსტი ნაპოვნია, გვერდი ${page}, ლიმიტი ${LIMIT}`);
    console.log(`სულ: ${totalPosts} პოსტი, kidev aqvs ${hasMore ? "დიახ" : "არა"}`);

    return Response.json({ posts, hasMore });
  } catch (error) {
    console.error("შეცდომა პოსტების ძიებისას:", error);
    return Response.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}