// src/components/Hashtags/HashtagBadge.tsx
import Link from "next/link";
import React from "react";

type HashtagBadgeProps = {
  tag: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const HashtagBadge: React.FC<HashtagBadgeProps> = ({ 
  tag, 
  count, 
  size = "md",
  className = ""
}) => {
  // ზომის კლასები
  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1 px-3",
    lg: "text-base py-2 px-4"
  };
  
  // მოვაშოროთ # სიმბოლო, თუ ესაა
  const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
  
  return (
    <Link 
      href={`/hashtag/${cleanTag}`}
      className={`inline-flex items-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-iconBlue ${sizeClasses[size]} ${className}`}
    >
      <span className="font-medium">#{cleanTag}</span>
      {count !== undefined && (
        <span className="ml-2 text-gray-300 text-xs">{count}</span>
      )}
    </Link>
  );
};

export default HashtagBadge;