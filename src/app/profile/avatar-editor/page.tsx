// src/app/profile/avatar-editor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { BigHead } from "@bigheads/core";
import { useRouter } from "next/navigation";
import { getGenderSpecificOptions, generateRandomBigHeadOptions } from "@/utils/avatarHelper";

export default function AvatarEditor() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [avatarOptions, setAvatarOptions] = useState(generateRandomBigHeadOptions());
  const [gender, setGender] = useState<string>("nonbinary");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (isLoaded && user) {
      // მოვიპოვოთ მიმდინარე პარამეტრები
      const fetchAvatarProps = async () => {
        try {
          const response = await fetch("/api/avatar");
          const data = await response.json();
          
          if (data.avatarProps) {
            setAvatarOptions(data.avatarProps);
          }
          
          if (data.gender) {
            setGender(data.gender);
          }
        } catch (error) {
          console.error("ავატარის პარამეტრების წაკითხვის შეცდომა:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAvatarProps();
    }
  }, [isLoaded, user]);
  
  // პარამეტრის განახლება
  const updateOption = (key: string, value: any) => {
    setAvatarOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // შემთხვევითი ავატარის გენერაცია
  const generateRandom = () => {
    const newOptions = generateRandomBigHeadOptions();
    setAvatarOptions(newOptions);
    setGender(newOptions.body === 'breasts' ? 'female' : 'male');
  };
  
  // ავატარის შენახვა
  const saveAvatar = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          avatarProps: avatarOptions,
          gender
        })
      });
      
      if (response.ok) {
        router.push("/profile");
      } else {
        throw new Error("შენახვის შეცდომა");
      }
    } catch (error) {
      console.error("ავატარის შენახვის შეცდომა:", error);
      alert("ავატარის შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">იტვირთება...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ავატარის რედაქტირება</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* პრევიუ */}
        <div className="w-64 h-64 mx-auto md:mx-0">
          <BigHead {...avatarOptions} />
        </div>
        
        {/* კონტროლები */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block mb-2">გენდერი</label>
            <select 
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                
                // გენდერის მიხედვით განახლება
                if (e.target.value === 'female') {
                  updateOption('body', 'breasts');
                  updateOption('lashes', true);
                } else {
                  updateOption('body', 'chest');
                }
              }}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              <option value="male">მამრობითი</option>
              <option value="female">მდედრობითი</option>
              <option value="nonbinary">არაბინარული</option>
            </select>
          </div>
          
          {/* თმის სტილი */}
          <div>
            <label className="block mb-2">თმის სტილი</label>
            <select 
              value={avatarOptions.hair}
              onChange={(e) => updateOption('hair', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              {getGenderSpecificOptions(gender).hairStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
          
          {/* თმის ფერი */}
          <div>
            <label className="block mb-2">თმის ფერი</label>
            <select 
              value={avatarOptions.hairColor}
              onChange={(e) => updateOption('hairColor', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              {['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'].map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          
          {/* კანის ფერი */}
          <div>
            <label className="block mb-2">კანის ფერი</label>
            <select 
              value={avatarOptions.skinTone}
              onChange={(e) => updateOption('skinTone', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              {['light', 'yellow', 'brown', 'dark', 'red', 'black'].map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>
          
          {/* აქსესუარები */}
          <div>
            <label className="block mb-2">აქსესუარები</label>
            <select 
              value={avatarOptions.accessory}
              onChange={(e) => updateOption('accessory', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
            >
              {['none', 'roundGlasses', 'tinyGlasses', 'shades'].map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
          
          {/* ღილაკები */}
          <div className="flex gap-4 pt-4">
            <button 
              onClick={generateRandom}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              შემთხვევითი ავატარი
            </button>
            
            <button 
              onClick={saveAvatar}
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "მიმდინარეობს შენახვა..." : "შენახვა"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}