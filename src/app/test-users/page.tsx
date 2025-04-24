// src/app/test-users/page.tsx
"use client";

import { useState, useEffect } from "react";
// BigHead-ს ჯერ არ ვიყენებთ, მხოლოდ მომხმარებლების ინფორმაციას ვაჩვენებთ

type User = {
  id: string;
  username: string;
  displayName: string | null;
  gender: string | null;
  avatarProps: string | null;
};

export default function TestUsersPage() {
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
        console.log("მიღებული მომხმარებლები:", data);
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
      <h1 className="text-2xl font-bold mb-6">მომხმარებლების ტესტი ({users.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-2">{user.displayName || user.username}</h2>
            <p className="text-sm text-gray-400">@{user.username}</p>
            <p className="text-sm mb-4">გენდერი: {user.gender || 'არ არის მითითებული'}</p>
            
            {user.avatarProps ? (
              <div>
                <p className="text-sm mb-2">ავატარის JSON:</p>
                <div className="text-xs bg-gray-700 p-2 rounded mb-4 overflow-auto max-h-28">
                  {user.avatarProps.substring(0, 200)}...
                </div>
                <pre className="text-xs bg-black p-2 rounded overflow-auto">
                  JSON სიგრძე: {user.avatarProps.length}
                </pre>
              </div>
            ) : (
              <p className="text-red-500">ავატარის პარამეტრები არ არის</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}