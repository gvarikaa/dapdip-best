// src/components/Hashtags/TrendingHashtags.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TrendingHashtag = {
  id: number;
  name: string;
  count: number;
};

const TrendingHashtags = () => {
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/hashtags/trending");
        
        if (!response.ok) {
          throw new Error("ვერ მოხერხდა ჰეშთეგების მიღება");
        }
        
        const data = await response.json();
        setHashtags(data);
      } catch (err) {
        console.error("ჰეშთეგების მიღების შეცდომა:", err);
        setError("ვერ მოხერხდა ტრენდული ჰეშთეგების მიღება");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingHashtags();
    
    // განახლება ყოველ 5 წუთში
    const interval = setInterval(fetchTrendingHashtags, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-4">ტრენდული ჰეშთეგები</h1>
        <div className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-5 bg-gray-700 rounded w-32"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-2">ტრენდული ჰეშთეგები</h1>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return (
      <div className="p-4 rounded-2xl border-[1px] border-borderGray">
        <h1 className="text-xl font-bold text-textGrayLight mb-2">ტრენდული ჰეშთეგები</h1>
        <p className="text-sm text-textGray">ჯერჯერობით ტრენდული ჰეშთეგები არ არის.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray">
      <h1 className="text-xl font-bold text-textGrayLight mb-4">ტრენდული ჰეშთეგები</h1>
      
      <div className="flex flex-col gap-3">
        {hashtags.map((hashtag) => (
          <Link 
            key={hashtag.id} 
            href={`/hashtag/${hashtag.name}`}
            className="hover:bg-gray-900 p-2 rounded transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-iconBlue font-medium">#{hashtag.name}</span>
              <span className="text-textGray text-xs">{hashtag.count} პოსტი</span>
            </div>
          </Link>
        ))}
      </div>
      
      <Link 
        href="/trending"
        className="block text-iconBlue hover:underline text-sm mt-4"
      >
        მეტის ნახვა
      </Link>
    </div>
  );
};

export default TrendingHashtags;