"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// დინამიურად ჩავტვირთავთ EmojiPicker კომპონენტს, რადგან ის მხოლოდ კლიენტის მხარეს მუშაობს
const Picker = dynamic(() => import('emoji-picker-react').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="p-2 bg-gray-800 rounded-lg shadow-lg">
      <div className="animate-pulse flex space-x-4">
        <div className="h-10 w-10 rounded-full bg-gray-700"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
});

type ModernEmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void;
};

const ModernEmojiPicker = ({ onEmojiSelect }: ModernEmojiPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // ვამოწმებთ კლიკებს picker-ის გარეთ, რომ დავხუროთ ის
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-gray-300"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </button>

      {showPicker && (
        <div className="absolute bottom-12 right-0 z-10">
          <Picker
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji);
              setShowPicker(false);
            }}
            searchPlaceholder="მოძებნეთ ემოჯი..."
            previewConfig={{ showPreview: false }}
            width={300}
            height={400}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default ModernEmojiPicker;