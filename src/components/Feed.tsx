import { prisma } from "@/prisma";
import Post from "./Post";
import { auth } from "@clerk/nextjs/server";
import InfiniteFeed from "./InfiniteFeed";

const Feed = async ({ userProfileId }: { userProfileId?: string }) => {
  const { userId } = await auth();

  if (!userId) return;

  // მსგავსი ლოგიკა რაც api/posts/route.ts-ში:
  const followings = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  let whereCondition;
  
  if (userProfileId) {
    // მომხმარებლის პროფილზე
    whereCondition = { parentPostId: null, userId: userProfileId };
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
    // ახალი მომხმარებლისთვის: ყველა პოსტი ან რამდენიმე ბოლო პოსტი
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
        gender: true,      // დავამატოთ გენდერი
        avatarProps: true  // დავამატოთ ავატარის პარამეტრები
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
    take: 15,
    skip: 0,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="">
      {posts.map((post) => (
        <div key={post.id}>
          <Post post={post} />
        </div>
      ))}
      <InfiniteFeed userProfileId={userProfileId} />
    </div>
  );
};

export default Feed;