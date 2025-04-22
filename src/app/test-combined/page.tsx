// src/app/test-combined/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// დინამიურად ჩავტვირთოთ SimpleBigHead კომპონენტი
const SimpleBigHead = dynamic(
  () => import('@/components/SimpleBigHead'),
  { ssr: false }
);

type User = {
  id: string;
  username: string;
  displayName: string | null;
  gender: string | null;
  avatarProps: string | null;
};

export default function TestCombinedPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/test-users');
        if (!response.ok) {
          throw new Error('პრობლემა მომხმარებლების მიღებისას');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("შეცდომა მომხმარებლების მიღებისას:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  if (loading) {
    return <div className="p-8">იტვირთება...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">მომხმარებლები ავატარებით</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(user => {
          // თუ მომხმარებელს აქვს ავატარის პარამეტრები, ვცდილობთ მათ პარსინგს
          let avatarProps = null;
          if (user.avatarProps) {
            try {
              avatarProps = JSON.parse(user.avatarProps);
            } catch (e) {
              console.error(`Invalid JSON for user ${user.username}:`, e);
            }
          }

          return (
            <div key={user.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {/* ავატარი */}
                <div className="w-20 h-20">
                  {avatarProps ? (
                    <SimpleBigHead avatarProps={avatarProps} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* მომხმარებლის ინფორმაცია */}
                <div>
                  <h2 className="text-lg font-bold">{user.displayName || user.username}</h2>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                  <p className="text-sm">გენდერი: {user.gender || 'არ არის მითითებული'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}