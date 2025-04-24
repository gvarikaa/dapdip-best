"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const fetchPosts = async (pageParam: number, userProfileId?: string, personalized: boolean = false) => {
  // დინამიური URL გამოყენება ნაცვლად ფიქსირებული მისამართისა
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  const url = new URL(`${baseUrl}/api/posts`);
  url.searchParams.append("cursor", pageParam.toString());
  url.searchParams.append("user", userProfileId || "undefined");
  url.searchParams.append("personalized", personalized.toString()); // პერსონალიზაციის პარამეტრი
  url.searchParams.append("limit", "10"); // დავამატოთ ლიმიტი
  
  const res = await fetch(url.toString());
  
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  
  return res.json();
};

const InfiniteFeed = ({ userProfileId }: { userProfileId?: string }) => {
  // ლოკალურად შევინახოთ პერსონალიზაციის პარამეტრი
  const [personalized, setPersonalized] = useLocalStorage('personalized-feed', true);
  
  const { data, error, status, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts", userProfileId, personalized], // დავამატოთ personalized ქეშის გასაუმჯობესებლად
    queryFn: ({ pageParam = 2 }) => fetchPosts(pageParam, userProfileId, personalized),
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 2 : undefined,
  });

  if (error) return (
    <div className="p-4 text-center">
      <p className="text-red-400">დატვირთვის დროს შეცდომა მოხდა!</p>
      <button 
        className="mt-2 text-iconBlue hover:underline" 
        onClick={() => fetchNextPage()}
      >
        ხელახლა ცდა
      </button>
    </div>
  );
  
  if (status === "pending") return (
    <div className="p-4 text-center">
      <div className="animate-spin h-8 w-8 border-2 border-iconBlue border-t-transparent rounded-full mx-auto mb-2"></div>
      <p className="text-textGray">იტვირთება...</p>
    </div>
  );

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];
  
  // დუბლიკატების ფილტრაცია ID-ით
  const uniquePosts = allPosts.filter(
    (post, index, self) => 
      index === self.findIndex((p) => p.id === post.id)
  );

  // პერსონალიზაციის ტოგლი
  const togglePersonalization = () => {
    setPersonalized(!personalized);
  };

  return (
    <>
      {/* პერსონალიზაციის გადამრთველი (მხოლოდ მთავარ გვერდზე) */}
      {!userProfileId && (
        <div className="p-3 flex justify-end">
          <button 
            onClick={togglePersonalization}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              personalized ? "bg-iconBlue text-white" : "bg-gray-800 text-textGray"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${personalized ? "bg-white" : "bg-textGray"}`}></span>
            {personalized ? "პერსონალიზებული" : "ქრონოლოგიური"}
          </button>
        </div>
      )}
      
      <InfiniteScroll
        dataLength={uniquePosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-iconBlue border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-textGray text-sm">პოსტები იტვირთება...</p>
          </div>
        }
        endMessage={
          <div className="p-4 text-center text-textGray text-sm">
            ყველა პოსტი ჩაიტვირთა!
          </div>
        }
      >
        {uniquePosts.map((post, index) => (
          <Post key={`infinite-${post.id}-${index}`} post={post}/>
        ))}
      </InfiniteScroll>
    </>
  );
};

export default InfiniteFeed;