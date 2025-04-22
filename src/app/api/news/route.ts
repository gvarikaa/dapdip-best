// src/app/api/news/route.ts
import { NextResponse } from "next/server";

// კეშის ტიპი
type NewsCache = {
  data: any;
  timestamp: number;
};

// გლობალური კეში
let newsCache: NewsCache | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 წუთი

export async function GET() {
  try {
    // შევამოწმოთ არის თუ არა კეში ჯერ კიდევ ვალიდური
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(newsCache.data);
    }
    
    const apiKey = process.env.NEWSDATA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API გასაღები არ არის კონფიგურირებული" },
        { status: 500 }
      );
    }
    
    const params = new URLSearchParams({
      apiKey: apiKey,
      language: "en",
      category: "technology",
      size: "10",
    });
    
    const response = await fetch(`https://newsdata.io/api/1/news?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`NewsData API შეცდომა: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // განვაახლოთ კეში
    newsCache = {
      data,
      timestamp: Date.now()
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("სიახლეების API შეცდომა:", error);
    return NextResponse.json(
      { error: "სიახლეების მიღება ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}