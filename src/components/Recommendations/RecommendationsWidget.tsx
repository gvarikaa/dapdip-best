// src/components/Recommendations/RecommendationsWidget.tsx
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import UserSuggestion, { UserSuggestionType } from "./UserSuggestion";
import EmptyState from "./EmptyState";

// ჩატვირთვის მდგომარეობის კომპონენტი
const RecommendationsLoading = () => (
  <div className="p-4 rounded-2xl border-[1px] border-borderGray">
    <h1 className="text-xl font-bold text-textGrayLight mb-4">კავშირების სარეკომენდაციო</h1>
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
            <div>
              <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="h-8 w-24 bg-gray-700 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

// მეგობრების რეკომენდაციების მთავარი კომპონენტი
const RecommendationsContent = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  // ვიღებთ მომხმარებლის კავშირებს (followings)
  const followings = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followedUserIds = followings.map((f) => f.followingId);

  // ვპოულობთ მეგობრის მეგობრებს (mutual connections)
  const friendRecommendations = await prisma.user.findMany({
    where: {
      id: { not: userId, notIn: followedUserIds },
      followings: { some: { followerId: { in: followedUserIds } } },
    },
    take: 3,
    select: { 
      id: true, 
      displayName: true, 
      username: true, 
      img: true,
      bio: true,
      gender: true,
      avatarProps: true,
    },
  });

  // თუ რეკომენდაციები ცარიელია, დამატებით მოვძებნოთ პოპულარული მომხმარებლები
  let recommendations = friendRecommendations;
  
  if (recommendations.length === 0) {
    // მოვძებნოთ პოპულარული მომხმარებლები (ბევრი follower-ით)
    const popularUsers = await prisma.user.findMany({
      where: {
        id: { not: userId, notIn: followedUserIds },
      },
      orderBy: {
        followers: {
          _count: 'desc'
        },
      },
      take: 3,
      select: { 
        id: true, 
        displayName: true, 
        username: true, 
        img: true,
        bio: true,
        gender: true,
        avatarProps: true,
      },
    });
    
    recommendations = popularUsers;
  }

  // ყოველი მომხმარებლისთვის ვითვლით საერთო კავშირების რაოდენობას
  const recommendationsWithMutual = await Promise.all(
    recommendations.map(async (user) => {
      const mutualFriends = await prisma.follow.count({
        where: {
          followerId: { in: followedUserIds },
          followingId: user.id,
        },
      });
      
      return {
        ...user,
        mutualFriends,
      } as UserSuggestionType;
    })
  );

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      <h1 className="text-xl font-bold text-textGrayLight">კავშირების სარეკომენდაციო</h1>
      
      {recommendationsWithMutual.length > 0 ? (
        <>
          {recommendationsWithMutual.map((person) => (
            <UserSuggestion key={person.id} user={person} />
          ))}
          
          <Link href="/explore" className="text-iconBlue hover:underline">
            მეტის ნახვა
          </Link>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

// მთავარი საექსპორტო კომპონენტი სასპენსით
const RecommendationsWidget = () => {
  return (
    <Suspense fallback={<RecommendationsLoading />}>
      <RecommendationsContent />
    </Suspense>
  );
};

export default RecommendationsWidget;