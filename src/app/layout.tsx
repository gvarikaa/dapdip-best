import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/providers/QueryProvider";
import { ChatSocketProvider } from "@/components/Chat/ChatSocketProvider";

export const metadata: Metadata = {
  title: "Lama Dev X Clone",
  description: "Next.js social media application project",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <QueryProvider>
        <html lang="en">
          <body>
            <ChatSocketProvider>
              {children}
            </ChatSocketProvider>
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}