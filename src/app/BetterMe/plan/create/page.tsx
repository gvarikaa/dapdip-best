"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const planDurations = [
  { value: "1_week", label: "1 კვირიანი გეგმა" },
  { value: "1_month", label: "1 თვიანი გეგმა" },
  { value: "3_months", label: "3 თვიანი გეგმა" },
];

// ტიპი პროფილისთვის
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

export default function CreatePlanPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

 // დაამატეთ ეს კოდი - პროფილის შემოწმება
 useEffect(() => {
  if (!isLoaded || !isSignedIn) return;
  
  const checkProfile = async () => {
    try {
      const response = await fetch("/api/better-me/profile");
      
      if (response.status === 404) {
        // თუ პროფილი არ არსებობს, გადავამისამართოთ პროფილის შექმნის გვერდზე
        router.push("/BetterMe/profile/create");
      }
    } catch (error) {
      console.error("პროფილის შემოწმების შეცდომა:", error);
    }
  };
  
  checkProfile();
}, [isLoaded, isSignedIn, router]);

  // მდგომარეობები
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  // პროფილის მიღება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/better-me/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setError("პროფილის მიღება ვერ მოხერხდა. ჯერ შექმენით პროფილი.");
        }
      } catch (error) {
        setError("პროფილის მიღების შეცდომა.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn]);

  // გეგმის შექმნა
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!duration) {
      setError("გთხოვთ აირჩიოთ გეგმის ხანგრძლივობა");
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/better-me/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "გეგმის შექმნა ვერ მოხერხდა");
      }

      // წარმატების შემთხვევაში, გადავამისამართოთ გეგმის გვერდზე
      router.push("/BetterMe/plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setGenerating(false);
    }
  };

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

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">პროფილი არ არსებობს</h1>
          <p className="mb-6 text-textGrayLight">
            გეგმის შესაქმნელად, ჯერ უნდა შექმნათ თქვენი ჯანმრთელობის პროფილი.
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
          <h1 className="text-2xl font-bold">ველნეს გეგმის შექმნა</h1>
          <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
            უკან დაბრუნება
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/40 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">თქვენი პროფილი</h2>
          <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-textGray">სქესი:</span>{" "}
              <span className="text-textGrayLight">
                {profile.gender ? 
                  profile.gender === "male" ? "მამრობითი" : 
                  profile.gender === "female" ? "მდედრობითი" : "სხვა" : 
                  "არ არის მითითებული"}
              </span>
            </div>
            <div>
              <span className="text-textGray">ასაკი:</span>{" "}
              <span className="text-textGrayLight">
                {profile.age || "არ არის მითითებული"}
              </span>
            </div>
            <div>
              <span className="text-textGray">სიმაღლე:</span>{" "}
              <span className="text-textGrayLight">
                {profile.height ? `${profile.height} სმ` : "არ არის მითითებული"}
              </span>
            </div>
            <div>
              <span className="text-textGray">წონა:</span>{" "}
              <span className="text-textGrayLight">
                {profile.weight ? `${profile.weight} კგ` : "არ არის მითითებული"}
              </span>
            </div>
            <div>
              <span className="text-textGray">სამიზნე წონა:</span>{" "}
              <span className="text-textGrayLight">
                {profile.targetWeight ? `${profile.targetWeight} კგ` : "არ არის მითითებული"}
              </span>
            </div>
            <div>
              <span className="text-textGray">მიზანი:</span>{" "}
              <span className="text-textGrayLight">
                {profile.goal || "არ არის მითითებული"}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-textGray">
            <Link href="/BetterMe/profile" className="text-iconBlue hover:underline">
              პროფილის რედაქტირება
            </Link>
            {" "}თუ გნებავთ ცვლილებების შეტანა.
          </div>
        </div>

        <form onSubmit={handleCreatePlan} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">შეარჩიეთ გეგმის ხანგრძლივობა</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {planDurations.map((plan) => (
                <label
                  key={plan.value}
                  className={`
                    flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer
                    ${duration === plan.value
                      ? "border-iconBlue bg-blue-900/20"
                      : "border-gray-700 hover:bg-gray-700/20"}
                  `}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={plan.value}
                    checked={duration === plan.value}
                    onChange={(e) => setDuration(e.target.value)}
                    className="sr-only"
                  />
                  <div className="bg-blue-900/40 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">{plan.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2">რა მიიღებთ:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>პერსონალიზებული კვების გეგმა</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>ვარჯიშის პროგრამა თქვენი დონისთვის</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>დეტალური ყოველკვირეული გეგმა</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>პროგრესის თვალყურის დევნება</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-between pt-4">
            <p className="text-sm text-textGray">
              შენიშვნა: AI-ის მიერ გენერირებული გეგმა დაფუძნებულია თქვენს პროფილზე. 
              გეგმის გენერირებას შეიძლება დასჭირდეს რამდენიმე წამი.
            </p>
            <button
              type="submit"
              disabled={generating || !duration}
              className={`bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${
                (generating || !duration) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {generating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  გენერირება...
                </span>
              ) : (
                "გეგმის შექმნა"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}