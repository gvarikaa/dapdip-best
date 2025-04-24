import Link from "next/link";
import Image from "@/components/Image";
import { currentUser } from "@clerk/nextjs/server";

export default async function BetterMeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  
  return (
    <div className="flex min-h-screen">
      {/* მობილური მენიუ ქვედა ნაწილში */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 lg:hidden z-50">
        <div className="flex justify-around">
          <Link
            href="/BetterMe"
            className="flex flex-col items-center p-2 text-textGray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">მთავარი</span>
          </Link>
          <Link
            href="/BetterMe/today"
            className="flex flex-col items-center p-2 text-textGray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">დღეს</span>
          </Link>
          <Link
            href="/BetterMe/meals"
            className="flex flex-col items-center p-2 text-textGray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs mt-1">კვება</span>
          </Link>
          <Link
            href="/BetterMe/progress"
            className="flex flex-col items-center p-2 text-textGray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">პროგრესი</span>
          </Link>
          <Link
            href="/BetterMe/consult"
            className="flex flex-col items-center p-2 text-textGray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs mt-1">კონსულტანტი</span>
          </Link>
        </div>
      </div>

      {/* დესკტოპის სანავიგაციო პანელი */}
      <div className="hidden lg:block w-64 border-r border-gray-800 min-h-screen sticky top-0 pt-4 pb-12 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-iconBlue rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Better Me</h1>
                <p className="text-textGray text-xs">ველნეს ასისტენტი</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            <Link
              href="/BetterMe"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>მთავარი გვერდი</span>
            </Link>
            
            <Link
              href="/BetterMe/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>ჩემი პროფილი</span>
            </Link>
            
            <Link
              href="/BetterMe/today"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>დღევანდელი გეგმა</span>
            </Link>
            
            <Link
              href="/BetterMe/plan"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-iconBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>ველნეს გეგმა</span>
            </Link>
            
            <Link
              href="/BetterMe/meals"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>კვების გეგმა</span>
            </Link>
            
            <Link
              href="/BetterMe/exercise"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>ვარჯიშის გეგმა</span>
            </Link>
            
            <Link
              href="/BetterMe/progress"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>პროგრესის გრაფიკები</span>
            </Link>
            
            <Link
              href="/BetterMe/consult"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-textGrayLight transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>AI კონსულტანტი</span>
            </Link>
          </nav>
          
          <div className="mt-auto px-4 py-4">
            {user && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={user.username || ""} w={32} h={32} />
                  ) : (
                    <div className="w-full h-full bg-iconBlue flex items-center justify-center text-white">
                      {user.firstName?.[0] || user.username?.[0] || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.firstName || user.username}</p>
                  <p className="text-xs text-textGray">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
            )}
            
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-textGray transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>დაბრუნება მთავარზე</span>
            </Link>
          </div>
        </div>
      </div>

      {/* მთავარი კონტენტის ნაწილი */}
      <div className="flex-1 overflow-hidden pb-20 lg:pb-0">
        {children}
      </div>
    </div>
  );
}