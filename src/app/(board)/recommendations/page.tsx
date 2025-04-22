// src/app/(board)/recommendations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "@/components/Image";
import { HashtagBadge } from "@/components/Hashtags";
import UserSuggestion from "@/components/Recommendations/UserSuggestion";
import ProfileAvatar from "@/components/ProfileAvatar";

export const metadata = {
  title: "პერსონალიზებული რეკომენდაციები",
  description: "იხილეთ კონტენტი, რომელიც შერჩეულია თქვენი ინტერესების მიხედვით.",
};

// ინტერესების ანალიზის ტიპები
type UserInterestItem = {
  name: string;
  frequency: number;
  percentage: number;
};

type UserInterests = {
  topInterests: UserInterestItem[];
  allInterests: UserInterestItem[];
};

type PostsActivity = {
  totalPosts: number;
  postsLast30Days: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  avgEngagement: number;
  topPosts: Array<{
    id: number;
    desc: string | null;
    likes: number;
    comments: number;
    reposts: number;
    totalEngagement: number;
    createdAt: string;
  }>;
};

type ContentAnalysis = {
  contentTypes: {
    image: { count: number; percentage: number };
    video: { count: number; percentage: number };
    text: { count: number; percentage: number };
  };
  textAnalysis: {
    avgLength: number;
    shortPosts: number;
    mediumPosts: number;
    longPosts: number;
  };
};

type AnalyticsResponse = {
  interests: UserInterests;
  postsActivity: PostsActivity;
  contentAnalysis: ContentAnalysis;
};

// რეკომენდაციების ტიპები
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

type UserSuggestionType = {
  id: string;
  displayName: string | null;
  username: string;
  img: string | null;
  bio?: string | null;
  gender?: string | null;
  avatarProps?: string | null;
  mutualFriends?: number;
};

type RecommendationsResponse = {
  posts: RecommendedPost[];
  users: UserSuggestionType[];
  hashtags: RecommendedHashtag[];
};

// პროგრეს ბარის კომპონენტი
const ProgressBar = ({ percentage = 0, color = "bg-iconBlue" }) => (
  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-500 ease-in-out`}
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

export default function RecommendationsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // პარალელურად მივიღოთ ანალიტიკა და რეკომენდაციები
        const [analyticsResponse, recommendationsResponse] = await Promise.all([
          fetch("/api/analytics/user-interests"),
          fetch("/api/recommendations/personalized")
        ]);

        if (!analyticsResponse.ok) {
          throw new Error("ანალიტიკის მიღება ვერ მოხერხდა");
        }

        if (!recommendationsResponse.ok) {
          throw new Error("რეკომენდაციების მიღება ვერ მოხერხდა");
        }

        const analyticsData = await analyticsResponse.json();
        const recommendationsData = await recommendationsResponse.json();

        setAnalytics(analyticsData);
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error("მონაცემების მიღების შეცდომა:", err);
        setError("მონაცემების მიღება ვერ მოხერხდა. სცადეთ მოგვიანებით.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">ავტორიზაცია საჭიროა</h1>
        <p className="mb-4">რეკომენდაციების სანახავად, გთხოვთ გაიაროთ ავტორიზაცია.</p>
        <Link href="/sign-in" className="bg-iconBlue text-white px-4 py-2 rounded-full">
          ავტორიზაცია
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-8 mb-6">
          <Link href="/">
            <Image path="icons/back.svg" alt="back" w={24} h={24} />
          </Link>
          <h1 className="text-2xl font-bold">პერსონალიზებული რეკომენდაციები</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-60 bg-gray-700 rounded"></div>
            <div className="h-60 bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-8 mb-6">
          <Link href="/">
            <Image path="icons/back.svg" alt="back" w={24} h={24} />
          </Link>
          <h1 className="text-2xl font-bold">პერსონალიზებული რეკომენდაციები</h1>
        </div>
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics || !recommendations) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-8 mb-6">
          <Link href="/">
            <Image path="icons/back.svg" alt="back" w={24} h={24} />
          </Link>
          <h1 className="text-2xl font-bold">პერსონალიზებული რეკომენდაციები</h1>
        </div>
        <p className="text-textGray">მონაცემები ვერ მოიძებნა.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-8 mb-6">
        <Link href="/">
          <Image path="icons/back.svg" alt="back" w={24} h={24} />
        </Link>
        <h1 className="text-2xl font-bold">პერსონალიზებული რეკომენდაციები</h1>
      </div>

      {/* ინტერესების სექცია */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">თქვენი ინტერესები</h2>
        <div className="bg-gray-900 rounded-lg p-6">
          {analytics.interests.topInterests.length > 0 ? (
            <div className="space-y-4">
              {analytics.interests.topInterests.map((interest) => (
                <div key={interest.name} className="space-y-1">
                  <div className="flex justify-between">
                    <Link href={`/hashtag/${interest.name}`} className="text-iconBlue">
                      #{interest.name}
                    </Link>
                    <span className="text-sm text-textGray">{interest.percentage}%</span>
                  </div>
                  <ProgressBar percentage={interest.percentage} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textGray text-center py-4">
              ინტერესები ჯერ არ არის გამოვლენილი. მეტი აქტივობა გაზრდის რეკომენდაციების ხარისხს.
            </p>
          )}
        </div>
      </section>

      {/* რეკომენდებული პოსტები */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">რეკომენდებული პოსტები</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.posts.length > 0 ? (
            recommendations.posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/${post.user.username}/status/${post.id}`}
                className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <ProfileAvatar
                      imageUrl={post.user.img}
                      username={post.user.username}
                      size="sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{post.user.displayName || post.user.username}</h3>
                    <p className="text-textGray text-sm">@{post.user.username}</p>
                  </div>
                </div>
                <p className="mt-3 text-textGrayLight">{post.desc || ""}</p>
                {post.img && (
                  <div className="mt-3 rounded-lg overflow-hidden h-40">
                    <Image
                      path={post.img}
                      alt=""
                      w={300}
                      h={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between mt-3 text-sm text-textGray">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-3">
                    <span>{post._count.likes} მოწონება</span>
                    <span>{post._count.comments} კომენტარი</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 col-span-2">
              <p className="text-textGray text-center">რეკომენდებული პოსტები ვერ მოიძებნა.</p>
            </div>
          )}
        </div>
      </section>

      {/* რეკომენდებული მომხმარებლები */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">ადამიანები, რომლებიც შეიძლება გაინტერესებდეთ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.users.length > 0 ? (
            recommendations.users.map((userItem) => (
              <div key={userItem.id} className="bg-gray-900 rounded-lg p-4">
                <UserSuggestion user={userItem} />
              </div>
            ))
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 col-span-3">
              <p className="text-textGray text-center">რეკომენდებული მომხმარებლები ვერ მოიძებნა.</p>
            </div>
          )}
        </div>
      </section>

      {/* რეკომენდებული ჰეშთეგები */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">ჰეშთეგები, რომლებიც შეიძლება გაინტერესებდეთ</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.hashtags.length > 0 ? (
            recommendations.hashtags.map((hashtag) => (
              <Link 
                key={hashtag.id}
                href={`/hashtag/${hashtag.name}`}
                className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg p-4"
              >
                <HashtagBadge 
                  tag={hashtag.name} 
                  count={hashtag._count.posts}
                  size="lg"
                />
              </Link>
            ))
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 col-span-4">
              <p className="text-textGray text-center">რეკომენდებული ჰეშთეგები ვერ მოიძებნა.</p>
            </div>
          )}
        </div>
      </section>

      {/* აქტივობის სტატისტიკა */}
      <section>
        <h2 className="text-xl font-bold mb-4">თქვენი აქტივობა</h2>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-iconBlue">{analytics.postsActivity.totalPosts}</h3>
              <p className="text-textGray">სულ პოსტები</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-iconBlue">{analytics.postsActivity.totalLikes}</h3>
              <p className="text-textGray">მოწონებები</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-iconBlue">{Math.round(analytics.postsActivity.avgEngagement * 10) / 10}</h3>
              <p className="text-textGray">საშუალო ჩართულობა</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">კონტენტის ტიპები</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">ტექსტი</span>
                  <span className="text-sm text-textGray">{analytics.contentAnalysis.contentTypes.text.percentage}%</span>
                </div>
                <ProgressBar percentage={analytics.contentAnalysis.contentTypes.text.percentage} color="bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">სურათები</span>
                  <span className="text-sm text-textGray">{analytics.contentAnalysis.contentTypes.image.percentage}%</span>
                </div>
                <ProgressBar percentage={analytics.contentAnalysis.contentTypes.image.percentage} color="bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">ვიდეო</span>
                  <span className="text-sm text-textGray">{analytics.contentAnalysis.contentTypes.video.percentage}%</span>
                </div>
                <ProgressBar percentage={analytics.contentAnalysis.contentTypes.video.percentage} color="bg-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}