"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// მესიჯის ტიპი
type Message = {
  role: "user" | "assistant";
  content: string;
};

// კონსულტაციის ტიპი API-დან
type Consultation = {
  id: number;
  userId: string;
  question: string;
  answer: string;
  topic: string;
  createdAt: string;
};

export default function ConsultPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // მდგომარეობები
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ძველი კონსულტაციების მიღება
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchConsultations = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/better-me/consult");
        if (response.ok) {
          const data = await response.json();
          setConsultations(data.consultations);
        }
      } catch (error) {
        console.error("კონსულტაციების მიღების შეცდომა:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [isLoaded, isSignedIn]);

  // ავტომატური სქროლი ახალ მესიჯებზე
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // ახალი კონსულტაციის გაგზავნა
  const sendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!question.trim()) return;
    
    setSending(true);
    setError(null);
    
    // ახალი შეკითხვის დამატება საუბარში
    setConversation((prev) => [...prev, { role: "user", content: question }]);
    
    try {
      const response = await fetch("/api/better-me/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          question,
          history: conversation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "კონსულტაციის მიღება ვერ მოხერხდა");
      }

      const data = await response.json();
      
      // კონსულტაციის შენახვა
      setConsultations((prev) => [data.consultation, ...prev]);
      
      // პასუხის დამატება საუბარში
      setConversation((prev) => [...prev, { role: "assistant", content: data.consultation.answer }]);
      
      // წავშალოთ შეყვანილი შეკითხვა
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
      console.error("კონსულტაციის შეცდომა:", err);
    } finally {
      setSending(false);
    }
  };

  // თემის ფერის განსაზღვრა
  const getTopicColor = (topic: string) => {
    const colors = {
      nutrition: "bg-green-600",
      exercise: "bg-orange-600",
      sleep: "bg-indigo-600",
      mental: "bg-purple-600",
      weight: "bg-red-600",
      general: "bg-gray-600",
    };
    return colors[topic as keyof typeof colors] || colors.general;
  };

  // თემის სახელის მიღება
  const getTopicName = (topic: string) => {
    const names = {
      nutrition: "კვება",
      exercise: "ვარჯიში",
      sleep: "ძილი",
      mental: "მენტალური ჯანმრთელობა",
      weight: "წონის კონტროლი",
      general: "ზოგადი",
    };
    return names[topic as keyof typeof names] || names.general;
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg min-h-[70vh] flex flex-col">
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-iconBlue rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">AI კონსულტანტი</h1>
              <p className="text-textGray text-sm">პერსონალური რჩევები ჯანმრთელობისა და ველნესისთვის</p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-full hover:bg-gray-700 mr-2"
              title={showHistory ? "დამალეთ ისტორია" : "ნახეთ ისტორია"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <Link href="/BetterMe" className="text-iconBlue hover:underline text-sm">
              უკან დაბრუნება
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex">
          {/* საუბრების ისტორია */}
          {showHistory && (
            <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto hidden md:block">
              <div className="p-3 border-b border-gray-700">
                <h2 className="font-semibold">კონსულტაციების ისტორია</h2>
              </div>
              
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-5 w-5 border-2 border-iconBlue border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-textGray mt-2">იტვირთება...</p>
                </div>
              ) : consultations.length > 0 ? (
                <div className="space-y-1 p-2">
                  {consultations.map((consultation) => (
                    <button
                      key={consultation.id}
                      onClick={() => {
                        setConversation([
                          { role: "user", content: consultation.question },
                          { role: "assistant", content: consultation.answer },
                        ]);
                      }}
                      className="w-full text-left p-2 hover:bg-gray-800 rounded-lg truncate block"
                    >
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getTopicColor(consultation.topic)}`}></span>
                        <span className="text-sm font-medium truncate">{getTopicName(consultation.topic)}</span>
                      </div>
                      <p className="text-xs text-textGray truncate">{consultation.question}</p>
                      <p className="text-xs text-textGray mt-1">
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-textGray">
                  <p>ჯერ არ გაქვთ კონსულტაციები</p>
                </div>
              )}
            </div>
          )}
          
          {/* საუბრის მთავარი ნაწილი */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="bg-gray-900 rounded-full p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">მოგესალმებათ Better Me-ს AI კონსულტანტი</h3>
                  <p className="text-textGrayLight mb-4 max-w-md">
                    დამისვით შეკითხვები კვების, ვარჯიშის, ჯანმრთელობის ან ველნესის შესახებ
                    და მიიღეთ პერსონალიზებული რჩევები.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                    <button
                      onClick={() => setQuestion("როგორ გავაუმჯობესო ძილის ხარისხი?")}
                      className="bg-gray-900 hover:bg-gray-700 p-2 rounded-lg text-left text-sm transition-colors"
                    >
                      "როგორ გავაუმჯობესო ძილის ხარისხი?"
                    </button>
                    <button
                      onClick={() => setQuestion("რა საკვები დამეხმარება წონის კლებაში?")}
                      className="bg-gray-900 hover:bg-gray-700 p-2 rounded-lg text-left text-sm transition-colors"
                    >
                      "რა საკვები დამეხმარება წონის კლებაში?"
                    </button>
                    <button
                      onClick={() => setQuestion("როგორ შევამცირო სტრესი ბუნებრივად?")}
                      className="bg-gray-900 hover:bg-gray-700 p-2 rounded-lg text-left text-sm transition-colors"
                    >
                      "როგორ შევამცირო სტრესი ბუნებრივად?"
                    </button>
                    <button
                      onClick={() => setQuestion("რა ტიპის ვარჯიშები არის საუკეთესო დამწყებისთვის?")}
                      className="bg-gray-900 hover:bg-gray-700 p-2 rounded-lg text-left text-sm transition-colors"
                    >
                      "რა ტიპის ვარჯიშები არის საუკეთესო დამწყებისთვის?"
                    </button>
                  </div>
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-3/4 rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-iconBlue text-white rounded-tr-none"
                          : "bg-gray-700 text-textGrayLight rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {error && (
              <div className="bg-red-900/40 text-red-400 p-2 mx-4 mb-4 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={sendQuestion} className="flex">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="დაუსვით შეკითხვა AI კონსულტანტს..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-l-lg p-3 text-textGrayLight"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !question.trim()}
                  className={`bg-iconBlue hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors ${
                    sending || !question.trim() ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {sending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
              <p className="text-xs text-textGray mt-2">
                გაითვალისწინეთ: AI კონსულტანტი გთავაზობთ ზოგად რჩევებს და არ ცვლის პროფესიონალთან კონსულტაციას.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}