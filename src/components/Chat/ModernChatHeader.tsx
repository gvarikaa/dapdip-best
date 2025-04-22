"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "../Image";
import ProfileAvatar from "../ProfileAvatar";

interface ModernChatHeaderProps {
  conversationId: string;
  chatName: string;
  chatImage?: string | null;
  isGroup: boolean;
  receiverId: string;
  isOnline?: boolean;
}

const ModernChatHeader = ({ 
  conversationId, 
  chatName, 
  chatImage, 
  isGroup, 
  receiverId,
  isOnline = false
}: ModernChatHeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Link href="/messages" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
        </Link>
        
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <ProfileAvatar
                imageUrl={chatImage}
                username={chatName}
                size="sm"
              />
            </div>
            {!isGroup && isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            )}
          </div>
          
          <div className="ml-3">
            <h1 className="font-bold text-white">{chatName}</h1>
            <span className="text-xs text-gray-400">
              {!isGroup && (isOnline ? "ონლაინ" : "ბოლოს ნანახი 12 საათის წინ")}
              {isGroup && `${isGroup ? "ჯგუფი" : "პირადი საუბარი"}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* ვიდეო ზარის ღილაკი */}
        {!isGroup && (
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="ვიდეო ზარი"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
        )}
        
        {/* აუდიო ზარის ღილაკი */}
        {!isGroup && (
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="აუდიო ზარი"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
        )}
        
        {/* მეტი ღილაკი */}
        <div className="relative">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  პროფილის ნახვა
                </button>
                {!isGroup && (
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    ბლოკირება
                  </button>
                )}
                {isGroup && (
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    ჯგუფიდან გასვლა
                  </button>
                )}
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  საუბრის წაშლა
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernChatHeader;