"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HashtagBadge } from "@/components/Hashtags";
import UserSuggestion, { UserSuggestionType } from "./UserSuggestion";
import EmptyState from "./EmptyState";
import Image from "../Image";
import ProfileAvatar from "../ProfileAvatar";

// პერსონალიზებული რეკომენდაციების ტიპები
type RecommendedPost = {
  id: number;
  desc: string | null;
  img: string | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    username: string;
    img: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

type RecommendedHashtag = {
  id: number;
  name: string;
  _count: {
    posts: number;
  };
};

type RecommendationsResponse = {
  posts: RecommendedPost[];
  users: UserSuggestionType[];
  hashtags: RecommendedHashtag[];
};

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "users" | "hashtags">("posts");

  // რეკომენდაციების მიღება API-დან
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/recommendations/personalized");
        
        if (!response.ok) {
          throw new Error("რეკომენდაციების მიღება ვერ მოხერხდა");
        }
        
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        console.error("რეკომენდაციების მიღების შეცდომა:", err);
        setError("რეკომენდაციების მიღება ვერ მოხერხდა. სცადეთ მოგვიანებით.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // ჩატვირთვის მდგომარეობა
  if (loading) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-4">თქვენთვის</h1>
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2">
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3 animate-pulse">
              <div className="bg-gray-700 w-16 h-16 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // შეცდომის მდგომარეობა
  if (error) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-2">თქვენთვის</h1>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // თუ რეკომენდაციები ცარიელია
  if (!recommendations || 
      (!recommendations.posts.length && 
       !recommendations.users.length && 
       !recommendations.hashtags.length)) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-2">თქვენთვის</h1>
        <EmptyState />
      </div>
    );
  }

  // რენდერი პოსტებისთვის
  const renderPosts = () => (
    <div className="space-y-4">
      {recommendations.posts.map((post) => (
        <Link 
          key={post.id} 
          href={`/${post.user.username}/status/${post.id}`}
          className="flex gap-3 hover:bg-gray-900 p-2 rounded-lg transition-colors"
        >
          {post.img ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden">
              <Image
                path={post.img}
                alt={post.desc || ""}
                w={80}
                h={80}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center">
              <ProfileAvatar
                imageUrl={post.user.img}
                username={post.user.username}
                size="sm"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{post.user.displayName || post.user.username}</h3>
                <p className="text-textGray text-sm">@{post.user.username}</p>
              </div>
              <span className="text-textGray text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-textGrayLight mt-1 line-clamp-2">
              {post.desc || ""}
            </p>
            <div className="flex gap-3 mt-2 text-xs text-textGray">
              <span>{post._count.likes} მოწონება</span>
              <span>{post._count.comments} კომენტარი</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  // რენდერი მომხმარებლებისთვის
  const renderUsers = () => (
    <div className="space-y-2">
      {recommendations.users.map((user) => (
        <UserSuggestion key={user.id} user={user} />
      ))}
    </div>
  );

  // რენდერი ჰეშთეგებისთვის
  const renderHashtags = () => (
    <div className="grid grid-cols-2 gap-3">
      {recommendations.hashtags.map((hashtag) => (
        <Link 
          key={hashtag.id}
          href={`/hashtag/${hashtag.name}`}
          className="p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <HashtagBadge 
            tag={hashtag.name} 
            count={hashtag._count.posts}
          />
          <p className="text-textGray text-xs mt-1">
            {hashtag._count.posts} პოსტი ამ ჰეშთეგით
          </p>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray">
      <h1 className="text-xl font-bold text-textGrayLight mb-3">თქვენთვის</h1>
      
      {/* ტაბები */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex space-x-2 bg-gray-800 p-1 rounded-full">
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              activeTab === "posts" ? "bg-iconBlue text-white" : "text-textGray"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            პოსტები
          </button>
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              activeTab === "users" ? "bg-iconBlue text-white" : "text-textGray"
            }`}
            onClick={() => setActiveTab("users")}
          >
            ადამიანები
          </button>
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              activeTab === "hashtags" ? "bg-iconBlue text-white" : "text-textGray"
            }`}
            onClick={() => setActiveTab("hashtags")}
          >
            ჰეშთეგები
          </button>
        </div>
      </div>
      
      {/* აქტიური ტაბის შინაარსი */}
      <div className="mt-3">
        {activeTab === "posts" && recommendations.posts.length > 0 ? renderPosts() : null}
        {activeTab === "users" && recommendations.users.length > 0 ? renderUsers() : null}
        {activeTab === "hashtags" && recommendations.hashtags.length > 0 ? renderHashtags() : null}
        
        {/* ცარიელი მდგომარეობა თითოეული ტაბისთვის */}
        {activeTab === "posts" && recommendations.posts.length === 0 && (
          <p className="text-center text-textGray">პერსონალიზებული პოსტები ვერ მოიძებნა</p>
        )}
        {activeTab === "users" && recommendations.users.length === 0 && (
          <p className="text-center text-textGray">რეკომენდებული მომხმარებლები ვერ მოიძებნა</p>
        )}
        {activeTab === "hashtags" && recommendations.hashtags.length === 0 && (
          <p className="text-center text-textGray">რეკომენდებული ჰეშთეგები ვერ მოიძებნა</p>
        )}
      </div>
      
      {/* მეტის ნახვა */}
      <div className="mt-4 text-center">
        <Link 
          href="/recommendations"
          className="text-iconBlue hover:underline text-sm"
        >
          იხილეთ მეტი რეკომენდაცია
        </Link>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;