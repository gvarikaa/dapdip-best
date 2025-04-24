// src/app/api/better-me/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// HealthProfile სქემა ვალიდაციისთვის
const HealthProfileSchema = z.object({
  gender: z.string().optional(),
  age: z.number().min(1).max(120).optional(),
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(20).max(300).optional(),
  targetWeight: z.number().min(20).max(300).optional(),
  goal: z.string().optional(),
  timeline: z.string().optional(),
  foodRestrictions: z.array(z.string()).optional(),
  dislikedFoods: z.array(z.string()).optional(),
  symptoms: z.record(z.boolean()).optional(),
  activityLevel: z.string().optional(),
  exercisePreference: z.string().optional(),
});

// პროფილის მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  try {
    // მივიღოთ არსებული პროფილი
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "პროფილი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // დავაფორმატოთ პროფილი ფრონტენდისთვის
    const formattedProfile = {
      ...profile,
      foodRestrictions: profile.foodRestrictions ? JSON.parse(profile.foodRestrictions) : [],
      dislikedFoods: profile.dislikedFoods ? JSON.parse(profile.dislikedFoods) : [],
      symptoms: profile.symptoms ? JSON.parse(profile.symptoms) : {}
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error("პროფილის მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// პროფილის შექმნა ან განახლება
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // მონაცემების ვალიდაცია
    const validationResult = HealthProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "არასწორი მონაცემები", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // მომზადება ბაზაში შესანახად - JSON მასივების/ობიექტების სტრინგად გარდაქმნა
    const profileData = {
      ...data,
      foodRestrictions: data.foodRestrictions ? JSON.stringify(data.foodRestrictions) : null,
      dislikedFoods: data.dislikedFoods ? JSON.stringify(data.dislikedFoods) : null,
      symptoms: data.symptoms ? JSON.stringify(data.symptoms) : null,
    };
    
    // ვეძებთ არსებულ პროფილს
    const existingProfile = await prisma.healthProfile.findUnique({
      where: { userId },
    });
    
    let profile;
    
    if (existingProfile) {
      // განვაახლოთ არსებული პროფილი
      profile = await prisma.healthProfile.update({
        where: { id: existingProfile.id },
        data: profileData,
      });
    } else {
      // შევქმნათ ახალი პროფილი
      profile = await prisma.healthProfile.create({
        data: {
          ...profileData,
          userId,
        },
      });
    }
    
    return NextResponse.json({
      message: existingProfile ? "პროფილი განახლებულია" : "პროფილი შექმნილია",
      profile
    });
  } catch (error) {
    console.error("პროფილის შენახვის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// პროფილის წაშლა
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  try {
    // ვეძებთ პროფილს
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "პროფილი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // წავშალოთ პროფილი
    await prisma.healthProfile.delete({
      where: { id: profile.id },
    });

    return NextResponse.json({ message: "პროფილი წაიშალა" });
  } catch (error) {
    console.error("პროფილის წაშლის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}