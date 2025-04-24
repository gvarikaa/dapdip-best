import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ModernNewChat from "@/components/Chat/ModernNewChat";

export const metadata = {
  title: "ახალი საუბარი",
  description: "დაიწყეთ საუბარი თქვენს კონტაქტებთან",
};

export default async function NewMessagePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 w-full">
      <ModernNewChat />
    </div>
  );
}