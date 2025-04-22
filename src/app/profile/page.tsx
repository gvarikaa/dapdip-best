// src/app/profile/page.tsx (ან სხვა გვერდი, სადაც პროფილის ავატარებს აჩვენებთ)
import { auth, currentUser } from "@clerk/nextjs/server";
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
  
  // დებაგინგი
  console.log("Profile avatarProps:", userProfile?.avatarProps);
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* პროფილის ავატარი */}
          <div className="w-32 h-32">
            <ProfileAvatar 
              imageUrl={user.imageUrl || userProfile?.img} 
              username={user.username || "user"}
              gender={userProfile?.gender || undefined}
              avatarProps={userProfile?.avatarProps} // აქ გადაეცით avatarProps
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
      </div>
    </div>
  );
}