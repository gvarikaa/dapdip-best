// src/app/(board)/trending/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/prisma";
import Link from "next/link";
import Image from "@/components/Image";

export const metadata = {
  title: "ტრენდული ჰეშთეგები",
  description: "ნახეთ რა არის პოპულარული ჩვენს პლატფორმაზე.",
};

const TrendingPage = async () => {
  const { userId } = await auth();

  if (!userId) return;

  // ვიღებთ ყველა ჰეშთეგს
  const hashtags = await prisma.hashtag.findMany();
  
  // თითოეული ჰეშთეგისთვის ვითვლით პოსტების რაოდენობას
  const hashtagsWithCounts = await Promise.all(
    hashtags.map(async (hashtag) => {
      // ბოლო 7 დღის მონაცემები
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
      
      // "ტრენდულობის" ქულა
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
  const trendingHashtags = hashtagsWithCounts
    .filter(hashtag => hashtag.count > 0)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 20); // ტოპ 20

  return (
    <div className="">
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <Image path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="font-bold text-lg">ტრენდული ჰეშთეგები</h1>
      </div>

      <div className="p-4">
        {trendingHashtags.length === 0 ? (
          <div className="text-center p-8">
            <h2 className="text-xl mb-4">ჯერჯერობით ტრენდული ჰეშთეგები არ არის</h2>
            <p className="text-textGray">
              როგორც კი მომხმარებლები დაიწყებენ პოსტების გამოქვეყნებას ჰეშთეგებით, ისინი აქ გამოჩნდება.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendingHashtags.map((hashtag) => (
              <Link 
                key={hashtag.id}
                href={`/hashtag/${hashtag.name}`}
                className="p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col">
                  <h2 className="text-iconBlue text-xl font-bold mb-1">
                    #{hashtag.name}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span className="text-textGray text-sm">
                      {hashtag.count} პოსტი
                    </span>
                    {hashtag.recentCount > 0 && (
                      <span className="text-iconBlue text-xs">
                        {hashtag.recentCount} ახალი ბოლო 7 დღეში
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;