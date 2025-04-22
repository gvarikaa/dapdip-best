import { auth } from "@clerk/nextjs/server";
import ModernChatList from "@/components/Chat/ModernChatList";
import { redirect } from "next/navigation";

export const metadata = {
  title: "მესიჯები",
  description: "ჩატი თქვენს მეგობრებთან და კონტაქტებთან",
};

export default async function MessagesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* სათაური */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">მესიჯები</h1>
        <p className="text-sm text-gray-400">პირადი საუბრები და ჯგუფური ჩატები</p>
      </div>
      
      {/* ჩატების სია */}
      <div className="flex-1 overflow-hidden">
        <ModernChatList />
      </div>
      
      {/* მობილურზე ნავიგაცია */}
      <div className="md:hidden border-t border-gray-800 bg-gray-900 p-2 flex justify-around">
        <button className="p-2 rounded-full hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button className="p-2 rounded-full bg-blue-600 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
}