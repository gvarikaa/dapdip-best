// src/components/News/NewsWidget.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewsItem, { NewsItemType } from "./NewsItem";
import NewsLoading from "./NewsLoading";

type NewsResponse = {
  status: string;
  totalResults: number;
  results: NewsItemType[];
};

const NewsWidget = () => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // დაკავშირება API-სთან
        const response = await fetch("/api/news");
        
        if (!response.ok) {
          throw new Error("ვერ მოხერხდა სიახლეების მიღება");
        }
        
        const data: NewsResponse = await response.json();
        
        if (data.status === "success" && data.results) {
          // მხოლოდ პირველი 5 სიახლე
          setNews(data.results.slice(0, 5));
        } else {
          setError("მონაცემების მიღების პრობლემა");
        }
      } catch (err) {
        console.error("სიახლეების მიღების შეცდომა:", err);
        setError("ვერ მოხერხდა სიახლეების მიღება");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // სიახლეების განახლება ყოველ 30 წუთში
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      <h1 className="text-xl font-bold text-textGrayLight">უახლესი ამბები</h1>
      
      {loading ? (
        <NewsLoading />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          {news.map((item, index) => (
            <NewsItem key={index} item={item} />
          ))}
          
          <Link href="https://newsdata.io" target="_blank" className="text-iconBlue text-sm hover:underline mt-2">
            მეტი სიახლე
          </Link>
        </>
      )}
    </div>
  );
};

export default NewsWidget;