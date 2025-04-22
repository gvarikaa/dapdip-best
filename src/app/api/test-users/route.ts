// src/app/api/test-users/route.ts
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        gender: true,
        avatarProps: true
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("შეცდომა მომხმარებლების მიღებისას:", error);
    return NextResponse.json(
      { error: "მომხმარებლების მიღება ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}