"use client";

import { useState } from "react";
import ProfileAvatar from "../ProfileAvatar";

type Participant = {
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    img: string | null;
  };
};

type ModernConversationParticipantsProps = {
  participants: Participant[];
  isGroup: boolean;
  name?: string | null;
};

const ModernConversationParticipants = ({
  participants,
  isGroup,
  name
}: ModernConversationParticipantsProps) => {
  const [showParticipants, setShowParticipants] = useState(false);

  if (!isGroup && participants.length < 3) return null;

  return (
    <div className="border-t border-gray-800 bg-gray-900">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setShowParticipants(!showParticipants)}
      >
        <span className="font-medium text-white">
          {isGroup ? "ჯგუფის მონაწილეები" : "საუბრის მონაწილეები"}
        </span>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-2">
            {participants.length} მონაწილე
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${showParticipants ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {showParticipants && (
        <div className="p-4 border-t border-gray-800 divide-y divide-gray-800">
          {participants.map((participant) => (
            <div 
              key={participant.userId}
              className="flex items-center gap-3 py-3 hover:bg-gray-800 px-2 rounded-lg transition-colors"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <ProfileAvatar
                  imageUrl={participant.user.img}
                  username={participant.user.username}
                  size="sm"
                />
              </div>
              <div>
                <div className="font-bold text-white">
                  {participant.user.displayName || participant.user.username}
                </div>
                <div className="text-sm text-gray-400">
                  @{participant.user.username}
                </div>
              </div>
              {isGroup && (
                <div className="ml-auto">
                  <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernConversationParticipants;