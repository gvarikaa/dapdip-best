// src/app/(board)/hashtag/[tag]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/prisma";
import Post from "@/components/Post";
import Link from "next/link";
import Image from "@/components/Image";

export async function generateMetadata({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag} - პოსტები`,
    description: `ნახეთ პოსტები ჰეშთეგით #${tag}`,
  };
}

const HashtagPage = async ({ params }: { params: { tag: string } }) => {
  const { userId } = await auth();
  const tag = decodeURIComponent(params.tag);

  if (!userId) return;

  // ვპოულობთ ჰეშთეგს
  const hashtag = await prisma.hashtag.findUnique({
    where: { name: tag.toLowerCase() },
  });

  if (!hashtag) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
          <Link href="/">
            <Image path="icons/back.svg" alt="back" w={24} h={24} />
          </Link>
          <h1 className="font-bold text-lg">#{tag}</h1>
        </div>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">ჰეშთეგი არ მოიძებნა</h2>
          <p className="text-textGray">
            ჰეშთეგით <span className="text-iconBlue">#{tag}</span> პოსტები არ მოიძებნა.
          </p>
        </div>
      </div>
    );
  }

  // ვპოულობთ პოსტებს ამ ჰეშთეგით
  const postHashtags = await prisma.postHashtag.findMany({
    where: { hashtagId: hashtag.id },
    include: {
      post: {
        include: {
          user: { 
            select: { 
              displayName: true, 
              username: true, 
              img: true,
              gender: true,
              avatarProps: true
            } 
          },
          _count: { select: { likes: true, rePosts: true, comments: true } },
          likes: { where: { userId }, select: { id: true } },
          rePosts: { where: { userId }, select: { id: true } },
          saves: { where: { userId }, select: { id: true } },
          rePost: {
            include: {
              user: { 
                select: { 
                  displayName: true, 
                  username: true, 
                  img: true,
                  gender: true,
                  avatarProps: true
                } 
              },
              _count: { select: { likes: true, rePosts: true, comments: true } },
              likes: { where: { userId }, select: { id: true } },
              rePosts: { where: { userId }, select: { id: true } },
              saves: { where: { userId }, select: { id: true } },
            }
          }
        }
      }
    },
    orderBy: { post: { createdAt: "desc" } },
  });

  const posts = postHashtags.map(ph => ph.post);

  return (
    <div className="">
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <Image path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="font-bold text-lg">#{tag}</h1>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-xl mb-4">ჯერჯერობით პოსტები არ არის</h2>
          <p className="text-textGray">
            ამ ჰეშთეგით ჯერ არავის გამოუქვეყნებია პოსტი.
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HashtagPage;