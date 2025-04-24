// განახლებული src/components/Search.tsx
"use client";

import Image from "./Image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SearchResult = {
  id: number;
  name: string;
  count: number;
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ძიების ფუნქცია
  const searchHashtags = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/hashtags/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("ძიების შეცდომა");
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("ჰეშთეგების ძიების შეცდომა:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ტაიმაუტი რომ ძალიან ხშირი მოთხოვნები არ გაიგზავნოს
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchHashtags(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // კლიკის მოსმენა ძიების ბოქსის გარეთ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ნავიგაცია Enter-ის დაჭერისას
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (query.startsWith('#')) {
        // თუ დაიწყო # სიმბოლოთი, მაშინ ეს ჰეშთეგია
        const tag = query.substring(1).trim();
        if (tag) {
          router.push(`/hashtag/${tag}`);
          setShowResults(false);
        }
      } else if (results.length > 0) {
        // წინააღმდეგ შემთხვევაში, გადავიდეთ პირველ შედეგზე
        router.push(`/hashtag/${results[0].name}`);
        setShowResults(false);
      }
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className='bg-inputGray py-2 px-4 flex items-center gap-4 rounded-full'>
        <Image path="icons/explore.svg" alt="search" w={16} h={16}/>
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="ძიება ჰეშთეგით..." 
          className="bg-transparent outline-none placeholder:text-textGray w-full"
        />
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-iconBlue border-t-transparent rounded-full"></div>
        )}
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="text-textGray hover:text-white"
          >
            &times;
          </button>
        )}
      </div>

      {/* შედეგების სია */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-inputGray rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {results.map((result) => (
            <Link 
              key={result.id} 
              href={`/hashtag/${result.name}`}
              onClick={() => {
                setShowResults(false);
                setQuery("");
              }}
              className="block p-3 hover:bg-gray-800 border-b border-borderGray last:border-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-iconBlue font-medium">#{result.name}</span>
                <span className="text-textGray text-xs">{result.count} პოსტი</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;