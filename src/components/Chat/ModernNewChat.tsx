"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ProfileAvatar from "../ProfileAvatar";

type UserSuggestion = {
  id: string;
  username: string;
  displayName: string | null;
  img: string | null;
  isOnline?: boolean;
};

const ModernNewChat = () => {
  const [receiverId, setReceiverId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const router = useRouter();
  const { user } = useUser();

  // დემო მიზნებისთვის, რეალურ აპში ეს API-დან უნდა მოდიოდეს
  useEffect(() => {
    // იმიტირებული მეგობრების სია
    const mockFriends: UserSuggestion[] = [
      { id: "user1", username: "giorgi123", displayName: "გიორგი", img: null, isOnline: true },
      { id: "user2", username: "nino_k", displayName: "ნინო", img: null, isOnline: false },
      { id: "user3", username: "luka87", displayName: "ლუკა", img: null, isOnline: true },
      { id: "user4", username: "tamari", displayName: "თამარი", img: null, isOnline: false },
      { id: "user5", username: "davit_d", displayName: "დავითი", img: null, isOnline: true },
    ];

    if (searchQuery.trim() === '') {
      setSuggestions(mockFriends);
    } else {
      // ფილტრაცია ძიების მიხედვით
      const filtered = mockFriends.filter(friend => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (friend.displayName && friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSuggestions(filtered);
    }
  }, [searchQuery]);

  const startConversation = async (userId: string) => {
    if (!user || startingChat) return;

    setStartingChat(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "გამარჯობა! 👋",
          receiverId: userId,
        }),
      });

      if (!response.ok) throw new Error("საუბრის დაწყება ვერ მოხერხდა");
      
      const message = await response.json();
      router.push(`/messages/${message.conversationId}`);
    } catch (error) {
      console.error("შეცდომა:", error);
      alert("საუბრის დაწყება ვერ მოხერხდა, სცადეთ მოგვიანებით");
    } finally {
      setStartingChat(false);
    }
  };

  const handleUserSelect = (selectedSuggestion: UserSuggestion) => {
    setSelectedUser(selectedSuggestion);
    setReceiverId(selectedSuggestion.id);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-1">ახალი საუბარი</h2>
        <p className="text-sm text-gray-400 mb-4">აირჩიეთ მომხმარებელი ან ჯგუფი საუბრის დასაწყებად</p>
        
        {/* ძიების ველი */}
        <div className="relative mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-3 top-3 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="მოძებნეთ მომხმარებლები..."
            className="w-full p-3 pl-10 pr-4 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
        
        {/* არჩეული მომხმარებელი */}
        {selectedUser && (
          <div className="bg-gray-800 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ProfileAvatar
                    imageUrl={selectedUser.img}
                    username={selectedUser.username}
                    size="sm"
                  />
                  {selectedUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{selectedUser.displayName || selectedUser.username}</div>
                  <div className="text-sm text-gray-400">@{selectedUser.username}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* დაწყების ღილაკი */}
        <button
          onClick={() => selectedUser && startConversation(selectedUser.id)}
          disabled={!selectedUser || startingChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-700"
        >
          {startingChat ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              საუბრის დაწყება...
            </div>
          ) : (
            <>საუბრის დაწყება</>
          )}
        </button>
      </div>
      
      {/* შემოთავაზებული კონტაქტები */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">შემოთავაზებული კონტაქტები</h3>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              კონტაქტები ვერ მოიძებნა
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map(suggestion => (
                <div 
                  key={suggestion.id}
                  onClick={() => handleUserSelect(suggestion)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === suggestion.id 
                      ? 'bg-blue-600' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <ProfileAvatar
                      imageUrl={suggestion.img}
                      username={suggestion.username}
                      size="sm"
                    />
                    {suggestion.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{suggestion.displayName || suggestion.username}</div>
                    <div className="text-sm text-gray-400">@{suggestion.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* სწრაფი ღილაკები */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3">
          ჯგუფის შექმნა
        </button>
        <button className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          კონტაქტების იმპორტი
        </button>
      </div>
    </div>
  );
};

export default ModernNewChat;