"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ტიპები
type ExercisePlan = {
  id: number;
  date: string;
  duration: number;
  intensity: string;
  exercises: {
    name: string;
    type: string;
    duration: number;
    sets?: number;
    reps?: number;
    description: string;
    alternativeExercise?: string;
  }[];
  warmup: string;
  cooldown: string;
  estimatedCaloriesBurned: number;
};

export default function ExercisePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPlan, setSelectedPlan] = useState<ExercisePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
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
          return;
        }
        
        // პროფილი არსებობს, ვცადოთ ვარჯიშის გეგმების მიღება
        await fetchExercisePlans();
      } catch (error) {
        console.error("პროფილის შემოწმების შეცდომა:", error);
        setLoading(false);
      }
    };
    
    checkProfile();
  }, [isLoaded, isSignedIn, router]);
  
  // ვარჯიშის გეგმების მიღება
  const fetchExercisePlans = async () => {
    try {
      setLoading(true);
      
      // აქ უნდა იყოს API მოთხოვნა მოსაძებნად ყველა ხელმისაწვდომი ვარჯიშის გეგმისა
      // სანიმუშოდ ვიყენებთ მხოლოდ დღევანდელ გეგმას
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/better-me/exercises?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setExercisePlans([data]);
        setSelectedPlan(data);
      }
    } catch (error) {
      console.error("ვარჯიშის გეგმების მიღების შეცდომა:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // ვარჯიშის გეგმა არჩეული თარიღისთვის
  const fetchExercisePlanForDate = async (date: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/better-me/exercises?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedPlan(data);
        
        // დავამატოთ მასივში თუ უკვე არ არის
        if (!exercisePlans.some(plan => plan.date === data.date)) {
          setExercisePlans(prev => [...prev, data]);
        }
      } else {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("ვარჯიშის გეგმის მიღების შეცდომა:", error);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };
  
  // ახალი ვარჯიშის გეგმის შექმნა
  const createExercisePlan = async () => {
    try {
      setCreatingPlan(true);
      setError(null);
      
      const response = await fetch("/api/better-me/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedPlan(data.exercisePlan);
        
        // დავამატოთ მასივში
        setExercisePlans(prev => [...prev, data.exercisePlan]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "ვარჯიშის გეგმის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("ვარჯიშის გეგმის შექმნის შეცდომა:", error);
      setError(error instanceof Error ? error.message : "უცნობი შეცდომა");
    } finally {
      setCreatingPlan(false);
    }
  };
  
  // თარიღის ცვლილებასთან ერთად, შეცვალეთ არჩეული ვარჯიშის გეგმა
  useEffect(() => {
    if (selectedDate) {
      // შევამოწმოთ თუ უკვე გვაქვს ეს გეგმა ჩატვირთული
      const existingPlan = exercisePlans.find(plan => plan.date.startsWith(selectedDate));
      
      if (existingPlan) {
        setSelectedPlan(existingPlan);
      } else {
        fetchExercisePlanForDate(selectedDate);
      }
    }
  }, [selectedDate, exercisePlans]);
  
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // ინტენსივობის ფერი
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'light':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'intense':
        return 'text-red-500';
      default:
        return 'text-textGrayLight';
    }
  };
  
  // ინტენსივობის სახელი ქართულად
  const getIntensityName = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'light':
        return 'მსუბუქი';
      case 'moderate':
        return 'საშუალო';
      case 'intense':
        return 'ინტენსიური';
      default:
        return intensity;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ვარჯიშის გეგმა</h1>
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
          <h2 className="text-lg font-semibold mb-3">თარიღის არჩევა</h2>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-2"
            />
            
            {!selectedPlan && !loading && (
              <button
                onClick={createExercisePlan}
                disabled={creatingPlan}
                className={`bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors ${
                  creatingPlan ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {creatingPlan ? "იქმნება..." : "შექმენით გეგმა ამ დღისთვის"}
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-iconBlue border-t-transparent rounded-full"></div>
          </div>
        ) : selectedPlan ? (
          <div>
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <h2 className="text-xl font-semibold">{formatDate(selectedPlan.date)}</h2>
              <div className="flex justify-between mt-2 text-sm">
                <div>
                  <span className="text-textGray">ხანგრძლივობა: </span>
                  <span className="text-textGrayLight">{selectedPlan.duration} წუთი</span>
                </div>
                <div>
                  <span className="text-textGray">ინტენსივობა: </span>
                  <span className={getIntensityColor(selectedPlan.intensity)}>
                    {getIntensityName(selectedPlan.intensity)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">გახურება</h3>
                <p className="text-textGrayLight text-sm">{selectedPlan.warmup}</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">გაგრილება</h3>
                <p className="text-textGrayLight text-sm">{selectedPlan.cooldown}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">ვარჯიშები</h3>
              
              <div className="space-y-4">
                {selectedPlan.exercises.map((exercise, index) => (
                  <div key={index} className="bg-gray-900 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <span className="text-xs text-textGray capitalize">{exercise.type}</span>
                      </div>
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                        {exercise.duration} წთ
                      </div>
                    </div>
                    
                    {(exercise.sets || exercise.reps) && (
                      <div className="mb-3 bg-gray-800 p-2 rounded-lg flex justify-between">
                        {exercise.sets && (
                          <div>
                            <span className="text-textGray text-xs">სეტი:</span>{" "}
                            <span className="font-medium">{exercise.sets}</span>
                          </div>
                        )}
                        {exercise.reps && (
                          <div>
                            <span className="text-textGray text-xs">გამეორება:</span>{" "}
                            <span className="font-medium">{exercise.reps}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm text-textGrayLight">{exercise.description}</p>
                    </div>
                    
                    {exercise.alternativeExercise && (
                      <div className="bg-gray-800 p-2 rounded-lg">
                        <h5 className="text-xs text-textGray mb-1">ალტერნატივა:</h5>
                        <p className="text-sm text-textGrayLight">{exercise.alternativeExercise}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">დაახლოებით დაწვავთ:</h3>
                <span className="text-xl font-semibold text-green-500">
                  {selectedPlan.estimatedCaloriesBurned} კკალ
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-3">ვარჯიშის გეგმა ამ დღისთვის არ არსებობს</h2>
            <p className="text-textGray mb-4">
              აირჩიეთ სხვა თარიღი ან შექმენით ახალი ვარჯიშის გეგმა არჩეული დღისთვის.
            </p>
            <button
              onClick={createExercisePlan}
              disabled={creatingPlan}
              className={`bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${
                creatingPlan ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {creatingPlan ? "იქმნება..." : "შექმენით ვარჯიშის გეგმა"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}