"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ტიპები
type ProfileFormData = {
  gender: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  goal: string;
  timeline: string;
  foodRestrictions: string[];
  dislikedFoods: string[];
  symptoms: Record<string, boolean>;
  activityLevel: string;
  exercisePreference: string;
};

const symptoms = [
  { id: "fatigue", label: "დაღლილობა" },
  { id: "headache", label: "თავის ტკივილი" },
  { id: "insomnia", label: "უძილობა" },
  { id: "bloating", label: "შებერილობა" },
  { id: "nausea", label: "გულისრევა" },
  { id: "anxiety", label: "შფოთვა" },
  { id: "mood_swings", label: "განწყობის ცვლილებები" },
  { id: "constipation", label: "შეკრულობა" },
  { id: "heartburn", label: "გულძმარვა" },
  { id: "joint_pain", label: "სახსრების ტკივილი" },
];

const goals = [
  { value: "weight_loss", label: "წონის კლება" },
  { value: "muscle_gain", label: "კუნთების მატება" },
  { value: "more_energy", label: "მეტი ენერგია" },
  { value: "better_sleep", label: "უკეთესი ძილი" },
  { value: "stress_reduction", label: "სტრესის შემცირება" },
  { value: "skin_health", label: "კანის ჯანმრთელობა" },
  { value: "overall_health", label: "საერთო ჯანმრთელობის გაუმჯობესება" },
];

const timelines = [
  { value: "1_week", label: "1 კვირა" },
  { value: "1_month", label: "1 თვე" },
  { value: "3_months", label: "3 თვე" },
];

const activityLevels = [
  { value: "sedentary", label: "პასიური (მინიმალური ფიზიკური აქტივობა)" },
  { value: "light", label: "მსუბუქი (კვირაში 1-2 ვარჯიში)" },
  { value: "moderate", label: "ზომიერი (კვირაში 3-4 ვარჯიში)" },
  { value: "active", label: "აქტიური (კვირაში 5-7 ვარჯიში)" },
  { value: "very_active", label: "ძალიან აქტიური (ინტენსიური ვარჯიში ყოველდღე)" },
];

const exercisePreferences = [
  { value: "cardio", label: "კარდიო (სირბილი, ცურვა, ველოსიპედი)" },
  { value: "strength", label: "ძალოსნობა (წონები, რეზისტენტული ვარჯიშები)" },
  { value: "yoga", label: "იოგა და სტრეჩინგი" },
  { value: "mixed", label: "შერეული (ყველა ტიპის ვარჯიში)" },
  { value: "no_preference", label: "არ მაქვს პრეფერენცია" },
];

export default function CreateHealthProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // ფორმის მდგომარეობა
  const [formData, setFormData] = useState<ProfileFormData>({
    gender: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
    goal: "",
    timeline: "",
    foodRestrictions: [],
    dislikedFoods: [],
    symptoms: symptoms.reduce((acc, symptom) => {
      acc[symptom.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    activityLevel: "",
    exercisePreference: "",
  });

  // ფორმის დამუშავების მდგომარეობა
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restrictionInput, setRestrictionInput] = useState("");
  const [dislikedFoodInput, setDislikedFoodInput] = useState("");

  // ფორმის ველების ცვლილების დამუშავება
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // შეზღუდვების დამატება
  const addRestriction = () => {
    if (restrictionInput.trim() !== "" && !formData.foodRestrictions.includes(restrictionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        foodRestrictions: [...prev.foodRestrictions, restrictionInput.trim()],
      }));
      setRestrictionInput("");
    }
  };

  // შეზღუდვების წაშლა
  const removeRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      foodRestrictions: prev.foodRestrictions.filter((r) => r !== restriction),
    }));
  };

  // არსაყვარელი საკვების დამატება
  const addDislikedFood = () => {
    if (dislikedFoodInput.trim() !== "" && !formData.dislikedFoods.includes(dislikedFoodInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        dislikedFoods: [...prev.dislikedFoods, dislikedFoodInput.trim()],
      }));
      setDislikedFoodInput("");
    }
  };

  // არსაყვარელი საკვების წაშლა
  const removeDislikedFood = (food: string) => {
    setFormData((prev) => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.filter((f) => f !== food),
    }));
  };

  // სიმპტომების ცვლილების დამუშავება
  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptomId]: checked,
      },
    }));
  };

  // ფორმის გაგზავნის დამუშავება
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // გადავაკონვერტიროთ რიცხვითი ველები
      const numericFormData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
      };

      // გავაგზავნოთ მონაცემები API-ზე
      const response = await fetch("/api/better-me/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(numericFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "პროფილის შექმნა ვერ მოხერხდა");
      }

      // წარმატების შემთხვევაში, გადავამისამართოთ მთავარ გვერდზე
      router.push("/BetterMe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ჯანმრთელობის პროფილის შექმნა</h1>
          <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
            უკან დაბრუნება
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/40 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ძირითადი ინფორმაცია */}
          <div>
            <h2 className="text-lg font-semibold mb-4">ძირითადი ინფორმაცია</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-textGrayLight mb-1">სქესი</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                >
                  <option value="">აირჩიეთ სქესი</option>
                  <option value="male">მამრობითი</option>
                  <option value="female">მდედრობითი</option>
                  <option value="other">სხვა</option>
                </select>
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">ასაკი</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="მაგ. 30"
                  min="1"
                  max="120"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                />
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">სიმაღლე (სმ)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="მაგ. 175"
                  min="50"
                  max="250"
                  step="0.1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                />
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">წონა (კგ)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="მაგ. 70"
                  min="20"
                  max="300"
                  step="0.1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                />
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">სამიზნე წონა (კგ)</label>
                <input
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  placeholder="სასურველი წონა"
                  min="20"
                  max="300"
                  step="0.1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                />
              </div>
            </div>
          </div>

          {/* მიზნები */}
          <div>
            <h2 className="text-lg font-semibold mb-4">მიზნები და პრეფერენციები</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-textGrayLight mb-1">მთავარი მიზანი</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                >
                  <option value="">აირჩიეთ მიზანი</option>
                  {goals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">დროის პერიოდი</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                >
                  <option value="">აირჩიეთ პერიოდი</option>
                  {timelines.map((timeline) => (
                    <option key={timeline.value} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">აქტივობის დონე</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                >
                  <option value="">აირჩიეთ აქტივობის დონე</option>
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-textGrayLight mb-1">ვარჯიშის პრეფერენცია</label>
                <select
                  name="exercisePreference"
                  value={formData.exercisePreference}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-textGrayLight"
                >
                  <option value="">აირჩიეთ ვარჯიშის ტიპი</option>
                  {exercisePreferences.map((pref) => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* კვების შეზღუდვები */}
          <div>
            <h2 className="text-lg font-semibold mb-4">კვების შეზღუდვები და პრეფერენციები</h2>
            
            <div className="mb-4">
              <label className="block text-textGrayLight mb-1">შეზღუდვები (მაგ. ვეგანი, უგლუტენო)</label>
              <div className="flex">
                <input
                  type="text"
                  value={restrictionInput}
                  onChange={(e) => setRestrictionInput(e.target.value)}
                  placeholder="დაამატეთ შეზღუდვა"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-l-lg p-2 text-textGrayLight"
                />
                <button
                  type="button"
                  onClick={addRestriction}
                  className="bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
              {formData.foodRestrictions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.foodRestrictions.map((restriction) => (
                    <span
                      key={restriction}
                      className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center"
                    >
                      {restriction}
                      <button
                        type="button"
                        onClick={() => removeRestriction(restriction)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-textGrayLight mb-1">არ მომწონს</label>
              <div className="flex">
                <input
                  type="text"
                  value={dislikedFoodInput}
                  onChange={(e) => setDislikedFoodInput(e.target.value)}
                  placeholder="დაამატეთ საკვები რომელიც არ მოგწონთ"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-l-lg p-2 text-textGrayLight"
                />
                <button
                  type="button"
                  onClick={addDislikedFood}
                  className="bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
              {formData.dislikedFoods.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.dislikedFoods.map((food) => (
                    <span
                      key={food}
                      className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center"
                    >
                      {food}
                      <button
                        type="button"
                        onClick={() => removeDislikedFood(food)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* სიმპტომები */}
          <div>
            <h2 className="text-lg font-semibold mb-4">სიმპტომები</h2>
            <p className="text-textGray mb-3">
              აირჩიეთ სიმპტომები, რომლებსაც განიცდით რეგულარულად:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={symptom.id}
                    checked={formData.symptoms[symptom.id]}
                    onChange={(e) => handleSymptomChange(symptom.id, e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={symptom.id} className="text-textGrayLight">
                    {symptom.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ღილაკები */}
          <div className="flex justify-end pt-4">
            <Link
              href="/BetterMe"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg mr-4 transition-colors"
            >
              გაუქმება
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`bg-iconBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "მიმდინარეობს..." : "შენახვა"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}