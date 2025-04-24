// src/app/api/better-me/exercises/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateDailyExercisePlan } from "@/utils/openai";
import { z } from "zod";

// ვარჯიშის გეგმის მოთხოვნის სქემა
const ExerciseRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD ფორმატი
  planId: z.number().optional(),
});

// ვარჯიშის გეგმის მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  
  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }
  
  if (!dateParam) {
    return NextResponse.json(
      { error: "თარიღის პარამეტრი აუცილებელია" },
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
    
    // ვეძებთ ვარჯიშის გეგმას ამ თარიღისთვის
    const exercisePlan = await prisma.exercisePlan.findFirst({
      where: {
        date: new Date(dateParam),
        plan: {
          profileId: profile.id,
        },
      },
      include: {
        logs: true,
      },
    });
    
    if (!exercisePlan) {
      return NextResponse.json(
        { error: "ვარჯიშის გეგმა ამ თარიღისთვის ვერ მოიძებნა" },
        { status: 404 }
      );
    }
    
    // დავაფორმატოთ ვარჯიშის გეგმის მონაცემები
    const formattedExercisePlan = {
      ...exercisePlan,
      exercises: exercisePlan.exercises ? JSON.parse(exercisePlan.exercises) : [],
    };
    
    return NextResponse.json(formattedExercisePlan);
  } catch (error) {
    console.error("ვარჯიშის გეგმის მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ახალი ვარჯიშის გეგმის შექმნა
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
    const validationResult = ExerciseRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "არასწორი მოთხოვნის პარამეტრები", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { date, planId } = validationResult.data;
    
    // ვეძებთ მომხმარებლის პროფილს
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
      include: {
        plans: {
          where: planId ? { id: planId } : {},
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "ჯანმრთელობის პროფილი ვერ მოიძებნა" },
        { status: 404 }
      );
    }
    
    // ვამოწმებთ არსებობს თუ არა ველნეს გეგმა
    if (profile.plans.length === 0) {
      return NextResponse.json(
        { error: "ველნეს გეგმა ვერ მოიძებნა. ჯერ შექმენით გეგმა." },
        { status: 404 }
      );
    }
    
    const plan = profile.plans[0];
    
    // ვამოწმებთ არსებობს თუ არა უკვე ვარჯიშის გეგმა ამ თარიღისთვის
    const existingExercisePlan = await prisma.exercisePlan.findFirst({
      where: {
        date: new Date(date),
        planId: plan.id,
      },
    });
    
    if (existingExercisePlan) {
      return NextResponse.json(
        { 
          message: "ვარჯიშის გეგმა ამ თარიღისთვის უკვე არსებობს", 
          exercisePlan: {
            ...existingExercisePlan,
            exercises: existingExercisePlan.exercises ? JSON.parse(existingExercisePlan.exercises) : [],
          }
        }
      );
    }
    
    // მოვამზადოთ პროფილის მონაცემები OpenAI-სთვის
    const profileData = {
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      exercisePreference: profile.exercisePreference,
    };
    
    // ვარჯიშის გეგმის გენერაცია OpenAI-ით
    const exerciseData = await generateDailyExercisePlan({
      profile: profileData,
      date,
      planDuration: plan.duration as '1_week' | '1_month' | '3_months',
    });
    
    // ვარჯიშის გეგმის შენახვა ბაზაში
    const newExercisePlan = await prisma.exercisePlan.create({
      data: {
        planId: plan.id,
        date: new Date(date),
        exercises: JSON.stringify(exerciseData.exercises),
        duration: exerciseData.duration,
        intensity: exerciseData.intensity,
      },
    });
    
    // დავაფორმატოთ ვარჯიშის გეგმის მონაცემები
    const formattedExercisePlan = {
      ...newExercisePlan,
      exercises: exerciseData.exercises || [],
    };
    
    return NextResponse.json({
      message: "ვარჯიშის გეგმა წარმატებით შეიქმნა",
      exercisePlan: formattedExercisePlan
    });
  } catch (error) {
    console.error("ვარჯიშის გეგმის შექმნის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}