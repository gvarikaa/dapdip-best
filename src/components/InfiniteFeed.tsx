"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";

const fetchPosts = async (pageParam: number, userProfileId?: string) => {
  // დინამიური URL გამოყენება ნაცვლად ფიქსირებული მისამართისა
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  const url = new URL(`${baseUrl}/api/posts`);
  url.searchParams.append("cursor", pageParam.toString());
  url.searchParams.append("user", userProfileId || "undefined");
  url.searchParams.append("limit", "10"); // დავამატოთ ლიმიტი
  
  const res = await fetch(url.toString());
  
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  
  return res.json();
};

const InfiniteFeed = ({ userProfileId }: { userProfileId?: string }) => {
  const { data, error, status, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts", userProfileId], // დავამატოთ userProfileId ქეშის გასაუმჯობესებლად
    queryFn: ({ pageParam = 2 }) => fetchPosts(pageParam, userProfileId),
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 2 : undefined,
  });

  if (error) return "Something went wrong!";
  if (status === "pending") return "Loading...";

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];

  return (
    <InfiniteScroll
      dataLength={allPosts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h1>Posts are loading...</h1>}
      endMessage={<h1>All posts loaded!</h1>}
    >
      {allPosts.map((post) => (
        <Post key={post.id} post={post}/>
      ))}
    </InfiniteScroll>
  );
};

export default InfiniteFeed;