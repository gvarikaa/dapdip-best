import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {children}
    </div>
  );
}