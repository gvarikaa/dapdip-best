"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ტიპები
type WellnessPlan = {
  id: number;
  title: string;
  description?: string;
  duration: string;
  startDate: string;
  endDate: string;
  content: any;
};

export default function PlanPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // პროფილის შემოწმება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const checkProfile = async () => {
      try {
        const response = await fetch("/api/better-me/profile");
        
        if (response.status === 404) {
          // თუ პროფილი არ არსებობს, გადავამისამართოთ პროფილის შექმნის გვერდზე
          router.push("/BetterMe/profile/create");
        } else if (response.ok) {
          // თუ პროფილი არსებობს, შევეცადოთ გეგმის მიღებას
          fetchPlan();
        }
      } catch (error) {
        console.error("პროფილის შემოწმების შეცდომა:", error);
        setLoading(false);
      }
    };
    
    checkProfile();
  }, [isLoaded, isSignedIn, router]);
  
  // გეგმის მიღება
  const fetchPlan = async () => {
    try {
      const response = await fetch("/api/better-me/plan");
      
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      } else if (response.status !== 404) {
        throw new Error("გეგმის მიღება ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("გეგმის მიღების შეცდომა:", error);
      setError("გეგმის მიღება ვერ მოხერხდა");
    } finally {
      setLoading(false);
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
  
  // თუ გეგმა არ არსებობს, გადავამისამართოთ გეგმის შექმნის გვერდზე
  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">ველნეს გეგმა ჯერ არ შექმნილა</h1>
          <p className="mb-6 text-textGrayLight">
            დაიწყეთ თქვენი ველნეს მოგზაურობა პერსონალიზებული გეგმის შექმნით.
          </p>
          <Link
            href="/BetterMe/plan/create"
            className="bg-iconBlue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            შექმენით გეგმა
          </Link>
        </div>
      </div>
    );
  }
  
  const planContent = plan.content || {};
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{plan.title}</h1>
            <p className="text-textGray">
              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
              უკან დაბრუნება
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/40 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">გეგმის მიმოხილვა</h2>
          <p className="text-textGrayLight">{planContent.overview || plan.description}</p>
          
          {planContent.goalDescription && (
            <div className="mt-4">
              <h3 className="font-medium text-iconBlue">მიზანი</h3>
              <p className="text-textGrayLight">{planContent.goalDescription}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">კვების ძირითადი პრინციპები</h2>
            <p className="text-textGrayLight">{planContent.nutritionOverview || "კვების დეტალური ინფორმაცია არ არის ხელმისაწვდომი."}</p>
            <Link 
              href="/BetterMe/meals" 
              className="block mt-4 text-center bg-iconBlue/20 hover:bg-iconBlue/30 text-iconBlue py-2 rounded-lg transition-colors text-sm"
            >
              კვების გეგმის ნახვა
            </Link>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">ვარჯიშის ძირითადი პრინციპები</h2>
            <p className="text-textGrayLight">{planContent.exerciseOverview || "ვარჯიშის დეტალური ინფორმაცია არ არის ხელმისაწვდომი."}</p>
            <Link 
              href="/BetterMe/exercise" 
              className="block mt-4 text-center bg-iconBlue/20 hover:bg-iconBlue/30 text-iconBlue py-2 rounded-lg transition-colors text-sm"
            >
              ვარჯიშის გეგმის ნახვა
            </Link>
          </div>
        </div>
        
        {planContent.weeklyBreakdown && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">კვირეული გეგმა</h2>
            <div className="space-y-4">
              {planContent.weeklyBreakdown.map((week: any, index: number) => (
                <div key={index} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium">კვირა {week.week}</h3>
                  
                  {week.goals && week.goals.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm text-textGray">მიზნები:</h4>
                      <ul className="list-disc list-inside">
                        {week.goals.map((goal: string, goalIndex: number) => (
                          <li key={goalIndex} className="text-textGrayLight text-sm">{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div>
                      <h4 className="text-sm text-textGray">კვების ფოკუსი:</h4>
                      <p className="text-textGrayLight text-sm">{week.nutritionFocus}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-textGray">ვარჯიშის ფოკუსი:</h4>
                      <p className="text-textGrayLight text-sm">{week.exerciseFocus}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {planContent.lifestyleTips && (
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">ცხოვრების სტილის რჩევები</h2>
              <ul className="space-y-2">
                {planContent.lifestyleTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-textGrayLight">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {planContent.progressTracking && (
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">პროგრესის თვალყურის დევნება</h2>
              
              {planContent.progressTracking.metrics && (
                <div className="mb-3">
                  <h3 className="text-sm text-textGray mb-1">გასაზომი მეტრიკები:</h3>
                  <ul className="list-disc list-inside">
                    {planContent.progressTracking.metrics.map((metric: string, index: number) => (
                      <li key={index} className="text-textGrayLight text-sm">{metric}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {planContent.progressTracking.checkpoints && (
                <div>
                  <h3 className="text-sm text-textGray mb-1">შესამოწმებელი წერტილები:</h3>
                  <ul className="list-disc list-inside">
                    {planContent.progressTracking.checkpoints.map((checkpoint: string, index: number) => (
                      <li key={index} className="text-textGrayLight text-sm">{checkpoint}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Link 
                href="/BetterMe/progress" 
                className="block mt-4 text-center bg-iconBlue/20 hover:bg-iconBlue/30 text-iconBlue py-2 rounded-lg transition-colors text-sm"
              >
                პროგრესის თვალყურის დევნება
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}