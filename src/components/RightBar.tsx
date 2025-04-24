// src/components/RightBar.tsx - გამოსწორებული ვერსია
"use client";

import Link from "next/link";
import Search from "./Search";
import dynamic from 'next/dynamic';
import { useUser } from "@clerk/nextjs";

// დინამიური იმპორტები ლოდინის კომპონენტის გარეშე
const NewsWidget = dynamic(() => import('./News').then(mod => mod.NewsWidget), { ssr: false });
const Recommendations = dynamic(() => import('./Recommendations'), { ssr: false });
const TrendingHashtags = dynamic(() => import('./Hashtags/TrendingHashtags'), { ssr: false });

const RightBar = () => {
  const { isSignedIn } = useUser();
  
  return (
    <div className="pt-4 flex flex-col gap-4 sticky top-0 h-max">
      <Search />
      <TrendingHashtags />
      <NewsWidget />
      <Recommendations />
      <div className="text-textGray text-sm flex gap-x-4 flex-wrap">
        <Link href="/">Terms of Service</Link>
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Cookie Policy</Link>
        <Link href="/">Accessibility</Link>
        <Link href="/">Ads Info</Link>
        <span>© 2025 L Corp.</span>
      </div>
    </div>
  );
};

export default RightBar;