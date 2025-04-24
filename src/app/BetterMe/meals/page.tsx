"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ტიპები
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
  groceryList: string[];
  estimatedCost: number;
};

export default function MealsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
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
        
        // პროფილი არსებობს, ვცადოთ კვების გეგმების მიღება
        await fetchMealPlans();
      } catch (error) {
        console.error("პროფილის შემოწმების შეცდომა:", error);
        setLoading(false);
      }
    };
    
    checkProfile();
  }, [isLoaded, isSignedIn, router]);
  
  // კვების გეგმის მიღება
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      
      // აქ უნდა იყოს API მოთხოვნა მოსაძებნად ყველა ხელმისაწვდომი კვების გეგმისა
      // სანიმუშოდ ვიყენებთ მხოლოდ დღევანდელ გეგმას
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/better-me/meals?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setMealPlans([data]);
        setSelectedMealPlan(data);
      }
    } catch (error) {
      console.error("კვების გეგმების მიღების შეცდომა:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // კვების გეგმა არჩეული თარიღისთვის
  const fetchMealPlanForDate = async (date: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/better-me/meals?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedMealPlan(data);
        
        // დავამატოთ მასივში თუ უკვე არ არის
        if (!mealPlans.some(plan => plan.date === data.date)) {
          setMealPlans(prev => [...prev, data]);
        }
      } else {
        setSelectedMealPlan(null);
      }
    } catch (error) {
      console.error("კვების გეგმის მიღების შეცდომა:", error);
      setSelectedMealPlan(null);
    } finally {
      setLoading(false);
    }
  };
  
  // ახალი კვების გეგმის შექმნა
  const createMealPlan = async () => {
    try {
      setCreatingPlan(true);
      setError(null);
      
      const response = await fetch("/api/better-me/meals", {
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
        setSelectedMealPlan(data.mealPlan);
        
        // დავამატოთ მასივში
        setMealPlans(prev => [...prev, data.mealPlan]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "კვების გეგმის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("კვების გეგმის შექმნის შეცდომა:", error);
      setError(error instanceof Error ? error.message : "უცნობი შეცდომა");
    } finally {
      setCreatingPlan(false);
    }
  };
  
  // თარიღის ცვლილებასთან ერთად, შეცვალეთ არჩეული კვების გეგმა
  useEffect(() => {
    if (selectedDate) {
      // შევამოწმოთ თუ უკვე გვაქვს ეს გეგმა ჩატვირთული
      const existingPlan = mealPlans.find(plan => plan.date.startsWith(selectedDate));
      
      if (existingPlan) {
        setSelectedMealPlan(existingPlan);
      } else {
        fetchMealPlanForDate(selectedDate);
      }
    }
  }, [selectedDate, mealPlans]);
  
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
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">კვების გეგმა</h1>
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
            
            {!selectedMealPlan && !loading && (
              <button
                onClick={createMealPlan}
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
        ) : selectedMealPlan ? (
          <div>
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <h2 className="text-xl font-semibold">{formatDate(selectedMealPlan.date)}</h2>
              <div className="flex justify-between mt-2 text-sm text-textGray">
                <span>დღიური კალორიები: {selectedMealPlan.calories}</span>
                <span>წყლის მიღება: {selectedMealPlan.waterIntake} ლიტრი</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">საუზმე</h3>
                <div className="mb-2">
                  <p className="font-medium">{selectedMealPlan.meals.breakfast.name}</p>
                  <span className="text-sm text-textGray">{selectedMealPlan.meals.breakfast.calories} კკალ</span>
                </div>
                
                <div className="mb-2">
                  <h4 className="text-sm text-textGray mb-1">შემადგენლობა:</h4>
                  <ul className="list-disc list-inside">
                    {selectedMealPlan.meals.breakfast.foods.map((food, index) => (
                      <li key={index} className="text-sm text-textGrayLight">{food}</li>
                    ))}
                  </ul>
                </div>
                
                {selectedMealPlan.meals.breakfast.recipe && (
                  <div>
                    <h4 className="text-sm text-textGray mb-1">მომზადების წესი:</h4>
                    <p className="text-sm text-textGrayLight">{selectedMealPlan.meals.breakfast.recipe}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">სადილი</h3>
                <div className="mb-2">
                  <p className="font-medium">{selectedMealPlan.meals.lunch.name}</p>
                  <span className="text-sm text-textGray">{selectedMealPlan.meals.lunch.calories} კკალ</span>
                </div>
                
                <div className="mb-2">
                  <h4 className="text-sm text-textGray mb-1">შემადგენლობა:</h4>
                  <ul className="list-disc list-inside">
                    {selectedMealPlan.meals.lunch.foods.map((food, index) => (
                      <li key={index} className="text-sm text-textGrayLight">{food}</li>
                    ))}
                  </ul>
                </div>
                
                {selectedMealPlan.meals.lunch.recipe && (
                  <div>
                    <h4 className="text-sm text-textGray mb-1">მომზადების წესი:</h4>
                    <p className="text-sm text-textGrayLight">{selectedMealPlan.meals.lunch.recipe}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">ვახშამი</h3>
                <div className="mb-2">
                  <p className="font-medium">{selectedMealPlan.meals.dinner.name}</p>
                  <span className="text-sm text-textGray">{selectedMealPlan.meals.dinner.calories} კკალ</span>
                </div>
                
                <div className="mb-2">
                  <h4 className="text-sm text-textGray mb-1">შემადგენლობა:</h4>
                  <ul className="list-disc list-inside">
                    {selectedMealPlan.meals.dinner.foods.map((food, index) => (
                      <li key={index} className="text-sm text-textGrayLight">{food}</li>
                    ))}
                  </ul>
                </div>
                
                {selectedMealPlan.meals.dinner.recipe && (
                  <div>
                    <h4 className="text-sm text-textGray mb-1">მომზადების წესი:</h4>
                    <p className="text-sm text-textGrayLight">{selectedMealPlan.meals.dinner.recipe}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">წასახემსებელი</h3>
                
                {selectedMealPlan.meals.snacks && selectedMealPlan.meals.snacks.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMealPlan.meals.snacks.map((snack, index) => (
                      <div key={index} className="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                        <div className="mb-1">
                          <p className="font-medium">{snack.name}</p>
                          <span className="text-sm text-textGray">{snack.calories} კკალ</span>
                        </div>
                        
                        <ul className="list-disc list-inside mb-1">
                          {snack.foods.map((food, foodIndex) => (
                            <li key={foodIndex} className="text-sm text-textGrayLight">{food}</li>
                          ))}
                        </ul>
                        
                        {snack.recipe && (
                          <p className="text-xs text-textGrayLight">{snack.recipe}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-textGray">ამ დღეს წასახემსებელი არ არის გათვალისწინებული</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">მაკრონუტრიენტები</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between mb-1">
                    <span>ცილა:</span>
                    <span>{selectedMealPlan.macros.protein} გ</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (selectedMealPlan.macros.protein / (selectedMealPlan.macros.protein + selectedMealPlan.macros.carbs + selectedMealPlan.macros.fat)) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span>ნახშირწყლები:</span>
                    <span>{selectedMealPlan.macros.carbs} გ</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (selectedMealPlan.macros.carbs / (selectedMealPlan.macros.protein + selectedMealPlan.macros.carbs + selectedMealPlan.macros.fat)) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span>ცხიმი:</span>
                    <span>{selectedMealPlan.macros.fat} გ</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (selectedMealPlan.macros.fat / (selectedMealPlan.macros.protein + selectedMealPlan.macros.carbs + selectedMealPlan.macros.fat)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold mb-3">პროდუქტების სია</h3>
                
                {selectedMealPlan.groceryList && selectedMealPlan.groceryList.length > 0 ? (
                  <div>
                    <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      {selectedMealPlan.groceryList.map((item, index) => (
                        <li key={index} className="text-sm text-textGrayLight">{item}</li>
                      ))}
                    </ul>
                    
                    {selectedMealPlan.estimatedCost && (
                      <p className="mt-3 text-sm text-textGray">
                        დაახლოებითი ღირებულება: {selectedMealPlan.estimatedCost} ლარი
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-textGray">პროდუქტების სია არ არის ხელმისაწვდომი</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-3">კვების გეგმა ამ დღისთვის არ არსებობს</h2>
            <p className="text-textGray mb-4">
              აირჩიეთ სხვა თარიღი ან შექმენით ახალი კვების გეგმა არჩეული დღისთვის.
            </p>
            <button
              onClick={createMealPlan}
              disabled={creatingPlan}
              className={`bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${
                creatingPlan ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {creatingPlan ? "იქმნება..." : "შექმენით კვების გეგმა"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}