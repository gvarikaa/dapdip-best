"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// მეალ პლან ტიპი
type MealPlan = {
  id: number;
  date: string;
  calories: number;
  meals: {
    breakfast: {
      name: string;
      foods: string[];
      calories: number;
      recipe: string;
    };
    lunch: {
      name: string;
      foods: string[];
      calories: number;
      recipe: string;
    };
    dinner: {
      name: string;
      foods: string[];
      calories: number;
      recipe: string;
    };
    snacks: {
      name: string;
      foods: string[];
      calories: number;
      recipe: string;
    }[];
  };
  waterIntake: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
};

// ექსერსაიზ პლან ტიპი
type ExercisePlan = {
  id: number;
  date: string;
  duration: number;
  intensity: string;
  exercises: {
    name: string;
    type: string;
    duration: number;
    sets: number;
    reps: number;
    description: string;
  }[];
  warmup: string;
  cooldown: string;
  estimatedCaloriesBurned: number;
};

// პროგრეს ლოგ ტიპი
type ProgressLog = {
  id: number;
  date: string;
  weight?: number;
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
  aiMessage?: string;
};

export default function TodayPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // მდგომარეობები
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState(() => new Date().toISOString().split('T')[0]); // დღევანდელი თარიღი YYYY-MM-DD ფორმატში
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
  const [progressLog, setProgressLog] = useState<ProgressLog | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [loadingExercisePlan, setLoadingExercisePlan] = useState(false);

  // გეგმების მიღება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // პროგრესის ლოგის მიღება
        await fetchProgressLog();
        
        // კვების გეგმის მიღება
        await fetchMealPlan();
        
        // ვარჯიშის გეგმის მიღება
        await fetchExercisePlan();
      } catch (err) {
        console.error("მონაცემების მიღების შეცდომა:", err);
        setError("მონაცემების მიღება ვერ მოხერხდა.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, date]);

  // პროგრესის ლოგის მიღება
  const fetchProgressLog = async () => {
    try {
      const response = await fetch(`/api/better-me/progress?startDate=${date}&endDate=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setProgressLog(data[0]);
        }
      }
    } catch (error) {
      console.error("პროგრესის ლოგის მიღების შეცდომა:", error);
    }
  };

  // კვების გეგმის მიღება
  const fetchMealPlan = async () => {
    try {
      const response = await fetch(`/api/better-me/meals?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setMealPlan(data);
      }
    } catch (error) {
      console.error("კვების გეგმის მიღების შეცდომა:", error);
    }
  };

  // ვარჯიშის გეგმის მიღება
  const fetchExercisePlan = async () => {
    try {
      const response = await fetch(`/api/better-me/exercises?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setExercisePlan(data);
      }
    } catch (error) {
      console.error("ვარჯიშის გეგმის მიღების შეცდომა:", error);
    }
  };

  // ახალი პროგრესის ლოგის შექმნა
  const createProgressLog = async () => {
    setLoadingProgress(true);
    try {
      const response = await fetch(`/api/better-me/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressLog(data.progressLog);
      } else {
        throw new Error("პროგრესის ლოგის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("პროგრესის ლოგის შექმნის შეცდომა:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // კვების გეგმის შექმნა
  const createMealPlan = async () => {
    setLoadingMealPlan(true);
    try {
      const response = await fetch(`/api/better-me/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMealPlan(data.mealPlan);
      } else {
        throw new Error("კვების გეგმის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("კვების გეგმის შექმნის შეცდომა:", error);
    } finally {
      setLoadingMealPlan(false);
    }
  };

  // ვარჯიშის გეგმის შექმნა
  const createExercisePlan = async () => {
    setLoadingExercisePlan(true);
    try {
      const response = await fetch(`/api/better-me/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercisePlan(data.exercisePlan);
      } else {
        throw new Error("ვარჯიშის გეგმის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("ვარჯიშის გეგმის შექმნის შეცდომა:", error);
    } finally {
      setLoadingExercisePlan(false);
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

  const formattedDate = new Date(date).toLocaleDateString('ka-GE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">დღევანდელი გეგმა</h1>
            <p className="text-textGray">{formattedDate}</p>
          </div>
          <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
            უკან დაბრუნება
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* პროგრესის ლოგი */}
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">დღიური პროგრესი</h2>
              <Link href="/BetterMe/progress" className="text-iconBlue text-sm hover:underline">
                დეტალები
              </Link>
            </div>

            {progressLog ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <p className="text-textGray text-xs">წონა</p>
                    <p className="text-lg">{progressLog.weight || "-"} კგ</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <p className="text-textGray text-xs">განწყობა</p>
                    <p className="text-lg">{progressLog.mood || "-"}</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <p className="text-textGray text-xs">ენერგია</p>
                    <p className="text-lg">{progressLog.energy ? `${progressLog.energy}/10` : "-"}</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <p className="text-textGray text-xs">ძილი</p>
                    <p className="text-lg">{progressLog.sleep || "-"} სთ</p>
                  </div>
                </div>
                {progressLog.aiMessage && (
                  <div className="bg-blue-900/20 border border-blue-800/30 p-2 rounded-lg">
                    <p className="text-sm text-textGrayLight">{progressLog.aiMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-textGray mb-3">დღევანდელი პროგრესი არ არის შენახული</p>
                <button
                  onClick={createProgressLog}
                  disabled={loadingProgress}
                  className={`bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                    loadingProgress ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingProgress ? "იტვირთება..." : "შექმენით ჩანაწერი"}
                </button>
              </div>
            )}
          </div>

          {/* კვების გეგმა */}
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">კვების გეგმა</h2>
              <Link href="/BetterMe/meals" className="text-iconBlue text-sm hover:underline">
                დეტალები
              </Link>
            </div>

            {mealPlan ? (
              <div className="space-y-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">საუზმე</p>
                    <span className="text-xs text-textGray">{mealPlan.meals.breakfast.calories} კკალ</span>
                  </div>
                  <p className="text-sm text-textGrayLight">{mealPlan.meals.breakfast.name}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">სადილი</p>
                    <span className="text-xs text-textGray">{mealPlan.meals.lunch.calories} კკალ</span>
                  </div>
                  <p className="text-sm text-textGrayLight">{mealPlan.meals.lunch.name}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">ვახშამი</p>
                    <span className="text-xs text-textGray">{mealPlan.meals.dinner.calories} კკალ</span>
                  </div>
                  <p className="text-sm text-textGrayLight">{mealPlan.meals.dinner.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-textGray">სულ: {mealPlan.calories} კკალ</p>
                  <p className="text-sm text-textGray">წყალი: {mealPlan.waterIntake} ლ</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-textGray mb-3">დღევანდელი კვების გეგმა არ არის შექმნილი</p>
                <button
                  onClick={createMealPlan}
                  disabled={loadingMealPlan}
                  className={`bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                    loadingMealPlan ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingMealPlan ? "იტვირთება..." : "შექმენით გეგმა"}
                </button>
              </div>
            )}
          </div>

          {/* ვარჯიშის გეგმა */}
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">ვარჯიშის გეგმა</h2>
              <Link href="/BetterMe/exercise" className="text-iconBlue text-sm hover:underline">
                დეტალები
              </Link>
            </div>

            {exercisePlan ? (
              <div className="space-y-3">
                <div className="mb-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-textGray">ხანგრძლივობა: {exercisePlan.duration} წთ</p>
                    <p className="text-sm text-textGray">{exercisePlan.intensity} ინტენსივობა</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {exercisePlan.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="bg-gray-800 p-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{exercise.name}</p>
                        <span className="text-xs text-textGray">{exercise.duration} წთ</span>
                      </div>
                      <p className="text-xs text-textGray">
                        {exercise.sets} სეტი × {exercise.reps} გამეორება
                      </p>
                    </div>
                  ))}
                  {exercisePlan.exercises.length > 3 && (
                    <p className="text-sm text-textGray text-center">
                      +{exercisePlan.exercises.length - 3} დამატებითი ვარჯიში
                    </p>
                  )}
                </div>
                <p className="text-sm text-textGray text-right">
                  დაახლ. კალორიები: {exercisePlan.estimatedCaloriesBurned}
                </p>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-textGray mb-3">დღევანდელი ვარჯიშის გეგმა არ არის შექმნილი</p>
                <button
                  onClick={createExercisePlan}
                  disabled={loadingExercisePlan}
                  className={`bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                    loadingExercisePlan ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingExercisePlan ? "იტვირთება..." : "შექმენით გეგმა"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* დღის შეჯამება */}
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">დღის შეჯამება</h2>
          
          {mealPlan && exercisePlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">კვება</h3>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>მიღებული კალორიები:</span>
                    <span className="font-semibold">{mealPlan.calories} კკალ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>დახარჯული კალორიები:</span>
                    <span className="font-semibold">{exercisePlan.estimatedCaloriesBurned} კკალ</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>ბალანსი:</span>
                    <span>
                      {mealPlan.calories - exercisePlan.estimatedCaloriesBurned} კკალ
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">მაკრონუტრიენტები</h3>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>ცილა:</span>
                    <span className="font-semibold">{mealPlan.macros.protein}გ</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>ნახშირწყლები:</span>
                    <span className="font-semibold">{mealPlan.macros.carbs}გ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ცხიმი:</span>
                    <span className="font-semibold">{mealPlan.macros.fat}გ</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-textGray text-center py-3">
              შექმენით კვებისა და ვარჯიშის გეგმები დღის შეჯამების სანახავად
            </p>
          )}
        </div>
      </div>

      {/* რჩევები და მოტივაცია */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">დღიური რჩევა</h2>
        <div className="bg-gray-900 p-4 rounded-xl">
          <p className="text-textGrayLight">
            "ყველა დიდი მიღწევა იწყება მცირე ნაბიჯებით. დღეს ფოკუსირდით პატარა დადებით ქმედებებზე და 
            არა იდეალურ შედეგზე. თითოეული სწორი არჩევანი თქვენ უფრო ახლოს გხდით თქვენს მიზანთან."
          </p>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-textGray">Better Me AI ასისტენტი</p>
            <Link
              href="/BetterMe/consult"
              className="text-iconBlue hover:underline text-sm"
            >
              მიიღეთ კონსულტაცია
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}