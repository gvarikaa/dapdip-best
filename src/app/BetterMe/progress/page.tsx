"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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

// ანალიზის ტიპი
type ProgressAnalysis = {
  summary: string;
  trends: {
    weight: string;
    mood: string;
    energy: string;
    sleep: string;
  };
  achievements: string[];
  challengeAreas: string[];
  recommendations: string[];
  motivationalMessage: string;
  nextSteps: string[];
};

export default function ProgressPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // მდგომარეობები
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ProgressLog | null>(null);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(false);
  
  // ლოგ ფორმის მდგომარეობა
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    mood: "",
    energy: "",
    sleep: "",
    notes: "",
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ბოლო 30 დღე
    endDate: new Date().toISOString().split('T')[0], // დღევანდელი დღე
  });

  // ლოგების მიღება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/better-me/progress?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
          
          // ავტომატურად ავარჩიოთ უახლესი ლოგი
          if (data.length > 0) {
            setSelectedLog(data[0]);
            setFormData({
              weight: data[0].weight?.toString() || "",
              mood: data[0].mood || "",
              energy: data[0].energy?.toString() || "",
              sleep: data[0].sleep?.toString() || "",
              notes: data[0].notes || "",
            });
          }
        } else {
          throw new Error("ლოგების მიღება ვერ მოხერხდა");
        }
      } catch (error) {
        console.error("ლოგების მიღების შეცდომა:", error);
        setError("ლოგების მიღება ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isLoaded, isSignedIn, dateRange]);

  // ლოგის არჩევისას ფორმის განახლება
  useEffect(() => {
    if (selectedLog) {
      setFormData({
        weight: selectedLog.weight?.toString() || "",
        mood: selectedLog.mood || "",
        energy: selectedLog.energy?.toString() || "",
        sleep: selectedLog.sleep?.toString() || "",
        notes: selectedLog.notes || "",
      });
    }
  }, [selectedLog]);

  // ფორმის ველების ცვლილების დამუშავება
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ფორმის გაგზავნის დამუშავება
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLog) return;
    
    try {
      const response = await fetch(`/api/better-me/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedLog.date,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          mood: formData.mood || undefined,
          energy: formData.energy ? parseInt(formData.energy) : undefined,
          sleep: formData.sleep ? parseFloat(formData.sleep) : undefined,
          notes: formData.notes || undefined,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // განვაახლოთ ლოგების სია
        setLogs((prev) =>
          prev.map((log) => (log.id === data.progressLog.id ? data.progressLog : log))
        );
        
        // განვაახლოთ არჩეული ლოგი
        setSelectedLog(data.progressLog);
        
        // გამოვრთოთ რედაქტირების რეჟიმი
        setEditMode(false);
      } else {
        throw new Error("ლოგის განახლება ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("ლოგის განახლების შეცდომა:", error);
      setError("ლოგის განახლება ვერ მოხერხდა");
    }
  };

  // ახალი ლოგის შექმნა
  const createNewLog = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // შევამოწმოთ ხომ არ არსებობს დღევანდელი ლოგი
      const todayLog = logs.find(log => log.date.startsWith(today));
      
      if (todayLog) {
        setSelectedLog(todayLog);
        setEditMode(true);
        return;
      }
      
      const response = await fetch(`/api/better-me/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: today,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // დავამატოთ ახალი ლოგი სიაში
        setLogs((prev) => [data.progressLog, ...prev]);
        
        // ავარჩიოთ ახალი ლოგი
        setSelectedLog(data.progressLog);
        
        // ჩავრთოთ რედაქტირების რეჟიმი
        setEditMode(true);
        
        // გავასუფთაოთ ფორმა
        setFormData({
          weight: "",
          mood: "",
          energy: "",
          sleep: "",
          notes: "",
        });
      } else {
        throw new Error("ახალი ლოგის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("ლოგის შექმნის შეცდომა:", error);
      setError("ახალი ლოგის შექმნა ვერ მოხერხდა");
    }
  };

  // პროგრესის ანალიზი
  const analyzeProgress = async () => {
    if (logs.length < 3) {
      setError("პროგრესის ანალიზისთვის საჭიროა მინიმუმ 3 ჩანაწერი");
      return;
    }
    
    setAnalyzingProgress(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/better-me/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        throw new Error("პროგრესის ანალიზი ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("ანალიზის შეცდომა:", error);
      setError("პროგრესის ანალიზი ვერ მოხერხდა");
    } finally {
      setAnalyzingProgress(false);
    }
  };

  // განწყობის ემოჯი
  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      great: "😃",
      good: "🙂",
      neutral: "😐",
      bad: "😕",
      terrible: "😞",
    };
    return moodEmojis[mood] || "❓";
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">პროგრესის თვალყურის დევნება</h1>
          <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
            უკან დაბრუნება
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/40 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ლოგების სია */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">პროგრესის ჩანაწერები</h2>
                <button
                  onClick={createNewLog}
                  className="bg-iconBlue hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  + ახალი
                </button>
              </div>
              
              {/* თარიღის ფილტრი */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-textGray text-xs mb-1">საწყისი თარიღი</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-textGray text-xs mb-1">საბოლოო თარიღი</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {logs.length > 0 ? (
                <div className="overflow-y-auto max-h-80 space-y-2">
                  {logs.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log);
                        setEditMode(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLog?.id === log.id ? "bg-blue-900/20 border border-blue-800/50" : "hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                        {log.mood && <span className="text-lg">{getMoodEmoji(log.mood)}</span>}
                      </div>
                      <div className="flex text-xs text-textGray mt-1 space-x-2">
                        {log.weight && <span>{log.weight} კგ</span>}
                        {log.energy && <span>ენერგია: {log.energy}/10</span>}
                        {log.sleep && <span>ძილი: {log.sleep} სთ</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-textGray">
                  <p>ჯერ არ გაქვთ პროგრესის ჩანაწერები</p>
                  <button
                    onClick={createNewLog}
                    className="mt-2 text-iconBlue hover:underline"
                  >
                    შექმენით პირველი ჩანაწერი
                  </button>
                </div>
              )}
            </div>
            
            {logs.length >= 3 && (
              <button
                onClick={analyzeProgress}
                disabled={analyzingProgress}
                className={`w-full bg-purple-700 hover:bg-purple-600 text-white p-3 rounded-xl transition-colors ${
                  analyzingProgress ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {analyzingProgress ? "ანალიზი მიმდინარეობს..." : "გააანალიზეთ პროგრესი"}
              </button>
            )}
          </div>

          {/* არჩეული ლოგისა და ანალიზის სანახავი/რედაქტირების ნაწილი */}
          <div className="lg:col-span-2 space-y-6">
            {/* არჩეული ლოგის დეტალები */}
            {selectedLog && (
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {new Date(selectedLog.date).toLocaleDateString()} - დეტალები
                  </h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-iconBlue hover:underline text-sm"
                  >
                    {editMode ? "გაუქმება" : "რედაქტირება"}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-textGrayLight mb-1">წონა (კგ)</label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          placeholder="შეიყვანეთ წონა"
                          step="0.1"
                          min="30"
                          max="250"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-textGrayLight mb-1">განწყობა</label>
                        <select
                          name="mood"
                          value={formData.mood}
                          onChange={handleChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        >
                          <option value="">აირჩიეთ განწყობა</option>
                          <option value="great">საუკეთესო 😃</option>
                          <option value="good">კარგი 🙂</option>
                          <option value="neutral">ნეიტრალური 😐</option>
                          <option value="bad">ცუდი 😕</option>
                          <option value="terrible">ძალიან ცუდი 😞</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-textGrayLight mb-1">ენერგია (1-10)</label>
                        <input
                          type="number"
                          name="energy"
                          value={formData.energy}
                          onChange={handleChange}
                          placeholder="ენერგიის დონე"
                          min="1"
                          max="10"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-textGrayLight mb-1">ძილი (საათი)</label>
                        <input
                          type="number"
                          name="sleep"
                          value={formData.sleep}
                          onChange={handleChange}
                          placeholder="ძილის ხანგრძლივობა"
                          step="0.5"
                          min="0"
                          max="24"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-textGrayLight mb-1">შენიშვნები</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="დამატებითი შენიშვნები..."
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        შენახვა
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-textGray text-sm">წონა</p>
                        <p className="text-lg font-medium">
                          {selectedLog.weight ? `${selectedLog.weight} კგ` : "-"}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-textGray text-sm">განწყობა</p>
                        <p className="text-lg font-medium">
                          {selectedLog.mood ? (
                            <span>
                              {selectedLog.mood.charAt(0).toUpperCase() + selectedLog.mood.slice(1)}{" "}
                              {getMoodEmoji(selectedLog.mood)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-textGray text-sm">ენერგია</p>
                        <p className="text-lg font-medium">
                          {selectedLog.energy ? `${selectedLog.energy}/10` : "-"}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-textGray text-sm">ძილი</p>
                        <p className="text-lg font-medium">
                          {selectedLog.sleep ? `${selectedLog.sleep} საათი` : "-"}
                        </p>
                      </div>
                    </div>
                    
                    {selectedLog.notes && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-textGray text-sm">შენიშვნები</p>
                        <p className="mt-1">{selectedLog.notes}</p>
                      </div>
                    )}
                    
                    {selectedLog.aiMessage && (
                      <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-lg">
                        <p className="text-textGray text-sm mb-1">AI-ის მოტივაციური შეტყობინება</p>
                        <p className="text-textGrayLight">{selectedLog.aiMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* პროგრესის ანალიზი */}
            {analysis && (
              <div className="bg-gray-900 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4">პროგრესის ანალიზი</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-textGray text-sm">შეჯამება</p>
                    <p className="mt-1">{analysis.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-textGray text-sm mb-2">ტრენდები</p>
                      <ul className="space-y-1 pl-2">
                        <li><span className="text-textGray">წონა:</span> {analysis.trends.weight}</li>
                        <li><span className="text-textGray">განწყობა:</span> {analysis.trends.mood}</li>
                        <li><span className="text-textGray">ენერგია:</span> {analysis.trends.energy}</li>
                        <li><span className="text-textGray">ძილი:</span> {analysis.trends.sleep}</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-textGray text-sm mb-2">მიღწევები</p>
                      <ul className="space-y-1">
                        {analysis.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-textGray text-sm mb-2">გამოწვევები</p>
                    <ul className="space-y-1">
                      {analysis.challengeAreas.map((challenge, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-lg">
                    <p className="text-textGray text-sm mb-2">მოტივაციური შეტყობინება</p>
                    <p className="text-textGrayLight">{analysis.motivationalMessage}</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-textGray text-sm mb-2">რეკომენდაციები</p>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-iconBlue mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-textGray text-sm mb-2">შემდეგი ნაბიჯები</p>
                    <ul className="space-y-1">
                      {analysis.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}