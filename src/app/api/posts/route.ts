import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getUserInterests } from "@/utils/recommendationUtils"; // დავამატოთ ინტერესების მიღების ფუნქცია

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const userProfileId = searchParams.get("user");
  const page = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  const personalizedParam = searchParams.get("personalized");
  const enablePersonalization = personalizedParam === "true";
  
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

    const followedUserIds = followings.map((f) => f.followingId);

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
            ...followedUserIds,
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
      hashtags: {
        include: {
          hashtag: true
        }
      }
    };

    // ჩვეულებრივი არაპერსონალიზებული პოსტები
    let posts = await prisma.post.findMany({
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

    // თუ პერსონალიზაცია ჩართულია და არ ვიმყოფებით კონკრეტული მომხმარებლის პროფილზე
    if (enablePersonalization && userProfileId === "undefined") {
      try {
        // მივიღოთ მომხმარებლის ინტერესები
        const userInterests = await getUserInterests(userId);
        
        // თუ მომხმარებელს აქვს ინტერესები
        if (userInterests.length > 0) {
          // განსაზღვრეთ რამდენი პერსონალიზებული პოსტი უნდა დაემატოს
          const personalizedLimit = Math.floor(LIMIT * 0.4); // 40% პერსონალიზებული პოსტები
          
          // მოვძებნოთ პერსონალიზებული პოსტები მომხმარებლის ინტერესების მიხედვით
          const personalizedPosts = await prisma.post.findMany({
            where: {
              id: { notIn: posts.map(p => p.id) }, // არ გავიმეოროთ უკვე მიღებული პოსტები
              parentPostId: null,
              hashtags: {
                some: {
                  hashtag: {
                    name: { in: userInterests }
                  }
                }
              }
            },
            include: {
              rePost: {
                include: postIncludeQuery,
              },
              ...postIncludeQuery,
            },
            take: personalizedLimit,
            orderBy: [
              { createdAt: 'desc' },
              { likes: { _count: 'desc' } }
            ],
          });
          
          // შევურიოთ პერსონალიზებული პოსტები
          if (personalizedPosts.length > 0) {
            // დავტოვოთ მხოლოდ 60% ჩვეულებრივი პოსტები
            const regularPostsLimit = LIMIT - personalizedPosts.length;
            posts = [...posts.slice(0, regularPostsLimit), ...personalizedPosts];
            
            // დავახარისხოთ პოსტები თარიღის მიხედვით
            posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
        }
      } catch (error) {
        console.error("პერსონალიზაციის შეცდომა:", error);
        // პერსონალიზაციის შეცდომის შემთხვევაში გააგრძელეთ ჩვეულებრივი პოსტებით
      }
    }

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