"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Image from "@/components/Image";

// დროებითი ტიპი პროფილისთვის
type HealthProfile = {
  id: number;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: string;
  timeline?: string;
  createdAt: string;
};

// დროებითი ტიპი გეგმისთვის
type WellnessPlan = {
  id: number;
  title: string;
  description?: string;
  duration: string;
  startDate: string;
  endDate: string;
  content: any;
};

export default function BetterMePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    daysActive: 0,
    progressEntries: 0,
    mealsLogged: 0,
    exercisesCompleted: 0,
  });

  // მომხმარებლის პროფილის მიღება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/better-me/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          
          // თუ არის პროფილი, ვცდილობთ გეგმის მიღებას
          if (data.id) {
            try {
              const planResponse = await fetch("/api/better-me/plan");
              if (planResponse.ok) {
                const planData = await planResponse.json();
                setPlan(planData);
              }
            } catch (error) {
              console.error("გეგმის მიღების შეცდომა:", error);
            }
          }
        }
      } catch (error) {
        console.error("პროფილის მიღების შეცდომა:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn]);

  // სტატისტიკის მიღება
  useEffect(() => {
    if (!profile) return;

    const fetchStats = async () => {
      try {
        // აქ შეგვიძლია მივიღოთ სტატისტიკა API-დან
        // დროებით ვიყენებთ ტესტის მონაცემებს
        setStats({
          daysActive: 7,
          progressEntries: 5,
          mealsLogged: 12,
          exercisesCompleted: 8,
        });
      } catch (error) {
        console.error("სტატისტიკის მიღების შეცდომა:", error);
      }
    };

    fetchStats();
  }, [profile]);

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

  // თუ პროფილი არ არსებობს, ვაჩვენებთ პროფილის შექმნის გვერდზე გადასვლის ბმულს
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
          <h1 className="text-2xl font-bold mb-4">მოგესალმებით Better Me-ში!</h1>
          
          <div className="mb-6">
            <Image 
              path="general/better-me.png" 
              alt="Better Me Logo" 
              w={165} 
              h={210} 
              className="mx-auto mb-4" 
            />
            <p className="mb-4">
              Better Me არის თქვენი პერსონალური ჯანმრთელობის და ველნესის ასისტენტი, 
              რომელიც დაგეხმარებათ უკეთესი ცხოვრების სტილის შექმნაში.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">დაიწყეთ თქვენი მოგზაურობა უკეთესი თქვენისკენ</h2>
            <p className="mb-4">
              შექმენით თქვენი ჯანმრთელობის პროფილი და მიიღეთ პერსონალიზებული:
            </p>
            <ul className="text-left mx-auto max-w-md mb-6 space-y-2">
              <li className="flex items-center">
                <div className="bg-iconBlue rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                კვების გეგმები თქვენი მიზნების მისაღწევად
              </li>
              <li className="flex items-center">
                <div className="bg-iconBlue rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                ვარჯიშის რუტინები თქვენი დონისთვის შესაფერისი
              </li>
              <li className="flex items-center">
                <div className="bg-iconBlue rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                პროგრესის ანალიზი და მოტივაციური რჩევები
              </li>
              <li className="flex items-center">
                <div className="bg-iconBlue rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                AI ასისტენტთან კონსულტაცია ჯანმრთელობის საკითხებზე
              </li>
            </ul>
          </div>
          
          <Link 
            href="/BetterMe/profile/create"
            className="bg-iconBlue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            შექმენით თქვენი პროფილი
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Better Me - პერსონალური ასისტენტი</h1>
          <Link
            href="/BetterMe/profile"
            className="text-iconBlue hover:underline text-sm"
          >
            პროფილის რედაქტირება
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">თქვენი პროფილი</h2>
            <div className="space-y-2 text-textGrayLight">
              <p>
                <span className="text-textGray">სქესი:</span>{" "}
                {profile.gender || "არ არის მითითებული"}
              </p>
              <p>
                <span className="text-textGray">ასაკი:</span>{" "}
                {profile.age || "არ არის მითითებული"}
              </p>
              <p>
                <span className="text-textGray">სიმაღლე:</span>{" "}
                {profile.height ? `${profile.height} სმ` : "არ არის მითითებული"}
              </p>
              <p>
                <span className="text-textGray">წონა:</span>{" "}
                {profile.weight ? `${profile.weight} კგ` : "არ არის მითითებული"}
              </p>
              <p>
                <span className="text-textGray">მიზანი:</span>{" "}
                {profile.goal || "არ არის მითითებული"}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">თქვენი სტატისტიკა</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-iconBlue text-2xl font-bold">{stats.daysActive}</p>
                <p className="text-textGray text-sm">აქტიური დღეები</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-iconBlue text-2xl font-bold">{stats.progressEntries}</p>
                <p className="text-textGray text-sm">პროგრესის ჩანაწერები</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-iconBlue text-2xl font-bold">{stats.mealsLogged}</p>
                <p className="text-textGray text-sm">ჩაწერილი კვებები</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-iconBlue text-2xl font-bold">{stats.exercisesCompleted}</p>
                <p className="text-textGray text-sm">შესრულებული ვარჯიშები</p>
              </div>
            </div>
          </div>
        </div>

        {plan ? (
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{plan.title}</h2>
              <span className="text-textGray text-sm">
                {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-textGrayLight mb-4">{plan.description}</p>
            <Link
              href="/BetterMe/plan"
              className="block w-full text-center bg-iconBlue hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              ნახეთ თქვენი გეგმა
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-4 mb-6 text-center">
            <h2 className="text-lg font-semibold mb-3">დაიწყეთ თქვენი მოგზაურობა</h2>
            <p className="text-textGrayLight mb-4">
              შექმენით თქვენი პერსონალიზებული ველნესის გეგმა და დაიწყეთ თქვენი ჯანმრთელობის გაუმჯობესება.
            </p>
            <Link
              href="/BetterMe/plan/create"
              className="block w-full text-center bg-iconBlue hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              შექმენით გეგმა
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/BetterMe/today"
            className="bg-gray-900 hover:bg-gray-700 p-4 rounded-xl text-center transition-colors"
          >
            <div className="bg-blue-900/30 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold">დღევანდელი გეგმა</h3>
          </Link>
          
          <Link
            href="/BetterMe/meals"
            className="bg-gray-900 hover:bg-gray-700 p-4 rounded-xl text-center transition-colors"
          >
            <div className="bg-green-900/30 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l-7 7-4-4" />
              </svg>
            </div>
            <h3 className="font-semibold">კვების გეგმა</h3>
          </Link>
          
          <Link
            href="/BetterMe/exercise"
            className="bg-gray-900 hover:bg-gray-700 p-4 rounded-xl text-center transition-colors"
          >
            <div className="bg-red-900/30 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="font-semibold">ვარჯიშის გეგმა</h3>
          </Link>
          
          <Link
            href="/BetterMe/progress"
            className="bg-gray-900 hover:bg-gray-700 p-4 rounded-xl text-center transition-colors"
          >
            <div className="bg-purple-900/30 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold">პროგრესი</h3>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI კონსულტანტი</h2>
          <Link 
            href="/BetterMe/consult"
            className="text-iconBlue hover:underline text-sm"
          >
            ისტორიის ნახვა
          </Link>
        </div>
        <p className="text-textGrayLight mb-4">
          დაუსვით შეკითხვები ჩვენს AI ასისტენტს კვების, ვარჯიშის, ჯანმრთელობის ან ველნესის შესახებ.
        </p>
        <Link
          href="/BetterMe/consult"
          className="block w-full sm:w-auto text-center bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          დავიწყოთ კონსულტაცია
        </Link>
      </div>
    </div>
  );
}