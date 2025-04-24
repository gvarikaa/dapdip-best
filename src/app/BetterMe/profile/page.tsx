"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ტიპები
type HealthProfile = {
  id: number;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: string;
  timeline?: string;
  foodRestrictions: string[];
  dislikedFoods: string[];
  symptoms: Record<string, boolean>;
  activityLevel?: string;
  exercisePreference?: string;
};

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/better-me/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          // პროფილი არ არსებობს
          setProfile(null);
        } else {
          throw new Error("პროფილის მიღება ვერ მოხერხდა");
        }
      } catch (error) {
        console.error("პროფილის მიღების შეცდომა:", error);
        setError("პროფილის მიღება ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isLoaded, isSignedIn]);
  
  if (!isLoaded) {
    return <div className="p-4 text-center">იტვირთება...</div>;
  }
  
  if (!isSignedIn) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">გთხოვთ გაიაროთ ავტორიზაცია Better Me-ს გამოსაყენებლად</p>
        <button
          onClick={() => router.push("/sign-in")}
          className="bg-iconBlue text-white px-4 py-2 rounded-full"
        >
          შესვლა
        </button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-iconBlue border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // თუ პროფილი არ არსებობს, გადავამისამართოთ პროფილის შექმნის გვერდზე
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">პროფილი არ არსებობს</h1>
          <p className="mb-6 text-textGrayLight">
            Better Me-ს გამოსაყენებლად, ჯერ უნდა შექმნათ თქვენი ჯანმრთელობის პროფილი.
          </p>
          <Link
            href="/BetterMe/profile/create"
            className="bg-iconBlue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            შექმენით პროფილი
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ჯანმრთელობის პროფილი</h1>
          <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
            უკან დაბრუნება
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-900/40 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">ძირითადი მონაცემები</h2>
            <div className="bg-gray-900 rounded-xl p-4 space-y-2">
              <div>
                <span className="text-textGray">სქესი:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.gender === 'male' ? 'მამრობითი' : 
                   profile.gender === 'female' ? 'მდედრობითი' : 
                   profile.gender || 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">ასაკი:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.age || 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">სიმაღლე:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.height ? `${profile.height} სმ` : 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">წონა:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.weight ? `${profile.weight} კგ` : 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">სამიზნე წონა:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.targetWeight ? `${profile.targetWeight} კგ` : 'არ არის მითითებული'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">მიზნები და პრეფერენციები</h2>
            <div className="bg-gray-900 rounded-xl p-4 space-y-2">
              <div>
                <span className="text-textGray">მთავარი მიზანი:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.goal || 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">დროის პერიოდი:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.timeline === '1_week' ? '1 კვირა' : 
                   profile.timeline === '1_month' ? '1 თვე' : 
                   profile.timeline === '3_months' ? '3 თვე' : 
                   'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">აქტივობის დონე:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.activityLevel || 'არ არის მითითებული'}
                </span>
              </div>
              <div>
                <span className="text-textGray">ვარჯიშის პრეფერენცია:</span>{" "}
                <span className="text-textGrayLight">
                  {profile.exercisePreference || 'არ არის მითითებული'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">საკვების შეზღუდვები</h2>
            <div className="bg-gray-900 rounded-xl p-4">
              {profile.foodRestrictions && profile.foodRestrictions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.foodRestrictions.map((restriction, index) => (
                    <span key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full">
                      {restriction}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-textGray">საკვების შეზღუდვები არ არის მითითებული</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">არ მოგწონთ</h2>
            <div className="bg-gray-900 rounded-xl p-4">
              {profile.dislikedFoods && profile.dislikedFoods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.dislikedFoods.map((food, index) => (
                    <span key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full">
                      {food}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-textGray">არ მოწონს არ არის მითითებული</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">სიმპტომები</h2>
            <div className="bg-gray-900 rounded-xl p-4">
              {profile.symptoms && Object.keys(profile.symptoms).some(key => profile.symptoms[key]) ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(profile.symptoms)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => (
                      <div key={key} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-iconBlue mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{key}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-textGray">სიმპტომები არ არის მითითებული</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link
            href="/BetterMe/profile/create"
            className="bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            პროფილის რედაქტირება
          </Link>
        </div>
      </div>
    </div>
  );
}