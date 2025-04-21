import { auth, currentUser } from "@clerk/nextjs";
import Link from "next/link";
import ProfileAvatar from "@/components/ProfileAvatar";
import { prisma } from "@/prisma";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!user || !userId) {
    return (
      <div className="p-4 text-center">
        გთხოვთ გაიაროთ ავტორიზაცია პროფილის სანახავად
      </div>
    );
  }
  
  // მოვიძიოთ მომხმარებლის დამატებითი ინფორმაცია მონაცემთა ბაზიდან
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* პროფილის ავატარი */}
          <div className="w-32 h-32">
            <ProfileAvatar 
              imageUrl={user.imageUrl || userProfile?.img} 
              username={user.username || "user"}
              gender={userProfile?.gender}
              size="lg"
            />
          </div>
          
          {/* პროფილის ინფორმაცია */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{userProfile?.displayName || user.username}</h1>
            <p className="text-gray-400">@{user.username}</p>
            
            {userProfile?.bio && (
              <p className="mt-2 text-gray-300">{userProfile.bio}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {/* ავატარის რედაქტირების ლინკი */}
              <Link 
                href="/profile/avatar-editor"
                className="inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              >
                ავატარის რედაქტირება
              </Link>
              
              {/* პროფილის რედაქტირების ლინკი */}
              <Link 
                href="/profile/edit"
                className="inline-block bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                პროფილის რედაქტირება
              </Link>
            </div>
          </div>
        </div>
        
        {/* დამატებითი ინფორმაცია */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProfile?.location && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{userProfile.location}</span>
            </div>
          )}
          
          {userProfile?.website && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {userProfile.website}
              </a>
            </div>
          )}
          
          {userProfile?.job && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{userProfile.job}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>შემოგვიერთდა {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>
      
      {/* პოსტების სექციას აქაც შეგიძლიათ დაამატოთ, მაგრამ ეს მოითხოვს მეტ კოდს */}
    </div>
  );
}