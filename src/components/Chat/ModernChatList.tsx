"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "timeago.js";
import { socket } from "@/socket";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import ProfileAvatar from "../ProfileAvatar";

type ConversationParticipant = {
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    img: string | null;
  };
};

type Conversation = {
  id: string;
  name: string | null;
  isGroup: boolean;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: {
    id: number;
    content: string;
    createdAt: string;
    senderId: string;
  }[];
};

const ModernChatList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        if (!response.ok) throw new Error("სასაუბროების მიღება ვერ მოხერხდა");
        
        const data = await response.json();
        setConversations(data);
        setFilteredConversations(data);
      } catch (error) {
        console.error("შეცდომა:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // ახალი მესიჯის მოსვლისას განვაახლოთ საუბრები
    const handleNewMessage = (message: any) => {
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.id === message.conversationId) {
            // განვაახლოთ ბოლო მესიჯი და დათარიღება
            return {
              ...conversation,
              messages: [message],
              updatedAt: message.createdAt
            };
          }
          return conversation;
        });
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  // ძიების ფუნქციონალი
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conversation => {
        // ვეძებთ ან სახელში ან მონაწილეების სახელებში
        const conversationName = getConversationName(conversation).toLowerCase();
        return conversationName.includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const openChat = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup && conversation.name) {
      return conversation.name;
    }
    
    // პირადი საუბრისთვის ვიპოვოთ მეორე მონაწილე
    const otherParticipant = conversation.participants.find(
      p => p.userId !== user?.id
    );
    
    if (otherParticipant && otherParticipant.user) {
      return otherParticipant.user.displayName || otherParticipant.user.username;
    }
    
    return "უცნობი საუბარი";
  };

  const getConversationImage = (conversation: Conversation) => {
    if (!conversation.isGroup) {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== user?.id
      );
      
      if (otherParticipant && otherParticipant.user && otherParticipant.user.img) {
        return otherParticipant.user.img;
      }
    }
    
    return null;
  };

  // საუბრის მოკლე შინაარსის ფორმატირება
  const formatLastMessage = (message: { content: string }) => {
    if (!message.content) return "";
    return message.content.length > 30 
      ? `${message.content.substring(0, 30)}...` 
      : message.content;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-4 border-b border-gray-800">
            <div className="bg-gray-700 w-12 h-12 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ძიების ველი */}
      <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="მოძებნეთ საუბარი..."
            className="w-full p-3 pr-10 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute right-3 top-3 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ახალი საუბრის ღილაკი */}
      <Link 
        href="/messages/new" 
        className="bg-blue-600 hover:bg-blue-700 text-white m-4 p-3 rounded-lg text-center font-medium transition-colors"
      >
        ახალი საუბარი
      </Link>
      
      {/* საუბრების სია */}
      <div className="overflow-y-auto flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchQuery 
              ? "მოძებნილი საუბარი ვერ მოიძებნა" 
              : "ჯერ არ გაქვთ სასაუბროები"}
          </div>
        ) : (
          filteredConversations
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((conversation) => {
              // ვიპოვოთ მეორე მონაწილე ან ჯგუფის ინფორმაცია
              const conversationName = getConversationName(conversation);
              const conversationImage = getConversationImage(conversation);
              
              // ბოლო მესიჯი
              const lastMessage = conversation.messages[0];
              
              // შემთხვევითი ონლაინ სტატუსი (რეალურ აპში ეს სოკეტიდან უნდა მოდიოდეს)
              const isOnline = Math.random() > 0.5;
              
              return (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => openChat(conversation.id)}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <ProfileAvatar
                        imageUrl={conversationImage}
                        username={conversationName}
                        size="sm"
                      />
                    </div>
                    {!conversation.isGroup && isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-white truncate">
                        {conversationName}
                      </h3>
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {lastMessage ? format(lastMessage.createdAt) : format(conversation.updatedAt)}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-gray-400 truncate text-sm">
                        {lastMessage.senderId === user?.id && "თქვენ: "}
                        {formatLastMessage(lastMessage)}
                      </p>
                    )}
                  </div>
                  {/* წაუკითხავი მესიჯების მაჩვენებელი (დემოსთვის შემთხვევით ვაჩვენებთ) */}
                  {Math.random() > 0.7 && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {Math.floor(Math.random() * 9) + 1}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default ModernChatList;