// src/app/api/better-me/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateWellnessPlan } from "@/utils/openai";
import { z } from "zod";

// ველნეს გეგმის მოთხოვნის სქემა
const PlanRequestSchema = z.object({
  duration: z.enum(["1_week", "1_month", "3_months"]),
});

// გეგმის მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  try {
    // ვეძებთ მომხმარებლის პროფილს
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
      include: {
        plans: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "ჯანმრთელობის პროფილი ვერ მოიძებნა. ჯერ შექმენით პროფილი." },
        { status: 404 }
      );
    }

    if (profile.plans.length === 0) {
      return NextResponse.json(
        { error: "ველნეს გეგმა ჯერ არ შექმნილა. გთხოვთ შექმნათ ახალი გეგმა." },
        { status: 404 }
      );
    }

    // დავაბრუნოთ უახლესი გეგმა
    const latestPlan = profile.plans[0];
    
    // დავაფორმატოთ გეგმის კონტენტი
    const formattedPlan = {
      ...latestPlan,
      content: JSON.parse(latestPlan.content)
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("გეგმის მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ახალი გეგმის შექმნა
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
    const validationResult = PlanRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "არასწორი მოთხოვნის პარამეტრები", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { duration } = validationResult.data;
    
    // ვეძებთ მომხმარებლის პროფილს
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "ჯანმრთელობის პროფილი ვერ მოიძებნა. ჯერ შექმენით პროფილი." },
        { status: 404 }
      );
    }
    
    // მოვამზადოთ პროფილის მონაცემები OpenAI-სთვის
    const profileData = {
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      targetWeight: profile.targetWeight,
      goal: profile.goal,
      timeline: profile.timeline,
      foodRestrictions: profile.foodRestrictions ? JSON.parse(profile.foodRestrictions) : [],
      dislikedFoods: profile.dislikedFoods ? JSON.parse(profile.dislikedFoods) : [],
      symptoms: profile.symptoms ? JSON.parse(profile.symptoms) : {},
      activityLevel: profile.activityLevel,
      exercisePreference: profile.exercisePreference,
    };
    
    // გეგმის გენერაცია OpenAI-ით
    const planData = await generateWellnessPlan({
      profile: profileData,
      duration,
    });
    
    // გეგმის შენახვა ბაზაში
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    // დავადგინოთ დასრულების თარიღი
    if (duration === "1_week") {
      endDate.setDate(startDate.getDate() + 7);
    } else if (duration === "1_month") {
      endDate.setMonth(startDate.getMonth() + 1);
    } else {
      endDate.setMonth(startDate.getMonth() + 3);
    }
    
    const newPlan = await prisma.wellnessPlan.create({
      data: {
        profileId: profile.id,
        title: planData.title,
        description: planData.overview,
        duration,
        startDate,
        endDate,
        content: JSON.stringify(planData),
      },
    });
    
    return NextResponse.json({
      message: "ველნეს გეგმა წარმატებით შეიქმნა",
      plan: {
        ...newPlan,
        content: planData
      }
    });
  } catch (error) {
    console.error("გეგმის შექმნის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}

// გეგმის წაშლა
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId");

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  if (!planId) {
    return NextResponse.json(
      { error: "გეგმის ID აუცილებელია" },
      { status: 400 }
    );
  }

  try {
    // ვეძებთ მომხმარებლის პროფილს
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "ჯანმრთელობის პროფილი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // ვამოწმებთ, რომ გეგმა ეკუთვნის ამ მომხმარებელს
    const plan = await prisma.wellnessPlan.findFirst({
      where: {
        id: parseInt(planId),
        profileId: profile.id,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "გეგმა ვერ მოიძებნა ან არ გეკუთვნით" },
        { status: 404 }
      );
    }

    // წავშალოთ გეგმა
    await prisma.wellnessPlan.delete({
      where: { id: plan.id },
    });

    return NextResponse.json({ message: "გეგმა წარმატებით წაიშალა" });
  } catch (error) {
    console.error("გეგმის წაშლის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}