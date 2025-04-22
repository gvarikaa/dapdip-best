"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import UserSuggestion, { UserSuggestionType } from "./UserSuggestion";
import EmptyState from "./EmptyState";

const RecommendationsWidget = () => {
  const [recommendations, setRecommendations] = useState<UserSuggestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // მოვითხოვოთ რეკომენდაციები API-დან
    const fetchRecommendations = async () => {
      try {
        // მარტივი მოთხოვნა პოპულარული მომხმარებლებისთვის
        // მომავალში შეგვიძლია ეს შევცვალოთ პერსონალიზებული მოთხოვნით
        const res = await fetch("/api/test-users");
        const data = await res.json();
        
        // ავიღოთ მხოლოდ პირველი 3 შედეგი და დავამატოთ ხელოვნურად დამატებითი ინფორმაცია
        const sampleRecommendations: UserSuggestionType[] = data
          .slice(0, 3)
          .map((user: any) => ({
            ...user,
            bio: user.bio || "მომხმარებელი პლატფორმაზე",
            mutualFriends: Math.floor(Math.random() * 5)
          }));
          
        setRecommendations(sampleRecommendations);
      } catch (error) {
        console.error("შეცდომა რეკომენდაციების მიღებისას:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
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
  }

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      <h1 className="text-xl font-bold text-textGrayLight">კავშირების სარეკომენდაციო</h1>
      
      {recommendations.length > 0 ? (
        <>
          {recommendations.map((person) => (
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

export default RecommendationsWidget;