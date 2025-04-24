// src/app/api/avatar/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// მომხმარებლის ავატარის პარამეტრების მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "ავტორიზებული არ ხართ" }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        avatarProps: true,
        gender: true 
      }
    });
    
    if (!user || !user.avatarProps) {
      return NextResponse.json({
        avatarProps: null,
        gender: user?.gender || null
      });
    }
    
    return NextResponse.json({
      avatarProps: JSON.parse(user.avatarProps),
      gender: user.gender
    });
  } catch (error) {
    console.error("ავატარის პარამეტრების წაკითხვის შეცდომა:", error);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}

// მომხმარებლის ავატარის პარამეტრების შენახვა
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "ავტორიზებული არ ხართ" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { avatarProps, gender } = body;
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        avatarProps: JSON.stringify(avatarProps),
        gender
      }
    });
    
    return NextResponse.json({ 
      message: "ავატარის პარამეტრები შენახულია" 
    });
  } catch (error) {
    console.error("ავატარის პარამეტრების შენახვის შეცდომა:", error);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}