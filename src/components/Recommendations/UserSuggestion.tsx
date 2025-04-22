// src/components/Recommendations/UserSuggestion.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "../Image";
import ProfileAvatar from "../ProfileAvatar";
import { followUser } from "@/action";

export type UserSuggestionType = {
  id: string;
  displayName: string | null;
  username: string;
  img: string | null;
  bio?: string | null;
  gender?: string | null;
  avatarProps?: string | null;
  mutualFriends?: number;
};

interface UserSuggestionProps {
  user: UserSuggestionType;
  onFollow?: () => void;
}

const UserSuggestion = ({ user, onFollow }: UserSuggestionProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    await followUser(user.id);
    setIsFollowing(true);
    setIsLoading(false);
    if (onFollow) onFollow();
  };

  return (
    <div className="flex items-center justify-between hover:bg-gray-900 p-2 rounded-lg transition-colors">
      {/* მომხმარებლის ინფორმაცია */}
      <Link href={`/${user.username}`} className="flex items-center gap-2">
        <div className="relative rounded-full overflow-hidden w-10 h-10">
          <ProfileAvatar
            imageUrl={user.img}
            username={user.username}
            gender={user.gender}
            avatarProps={user.avatarProps}
            size="sm"
          />
        </div>
        <div>
          <h3 className="font-bold text-sm">
            {user.displayName || user.username}
          </h3>
          <div className="flex flex-col">
            <span className="text-textGray text-xs">@{user.username}</span>
            {user.mutualFriends && user.mutualFriends > 0 && (
              <span className="text-textGray text-xs">
                {user.mutualFriends} საერთო კონტაქტი
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* დაკავშირების ღილაკი */}
      <button
        onClick={handleFollow}
        disabled={isFollowing || isLoading}
        className={`py-1 px-4 font-semibold rounded-full text-sm transition-colors ${
          isFollowing
            ? "bg-transparent border border-white text-white"
            : "bg-white text-black hover:bg-gray-200"
        } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isLoading ? "..." : isFollowing ? "დაკავშირებული" : "დაკავშირება"}
      </button>
    </div>
  );
};

export default UserSuggestion;