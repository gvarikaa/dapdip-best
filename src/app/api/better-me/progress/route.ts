// src/app/api/better-me/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { analyzeProgress } from "@/utils/openai";
import { z } from "zod";

// პროგრესის ლოგის სქემა ვალიდაციისთვის
const ProgressLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD ფორმატი
  weight: z.number().min(20).max(300).optional(),
  mood: z.string().optional(),
  energy: z.number().min(1).max(10).optional(),
  sleep: z.number().min(0).max(24).optional(),
  notes: z.string().optional(),
  planId: z.number().optional(),
});

// პროგრესის ლოგების მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: "ჯანმრთელობის პროფილი ვერ მოიძებნა" },
        { status: 404 }
      );
    }
    
    // ფილტრი თარიღის მიხედვით
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
        },
      };
    } else if (endDate) {
      dateFilter = {
        date: {
          lte: new Date(endDate),
        },
      };
    }
    
    // ვიღებთ პროგრესის ლოგებს
    const logs = await prisma.progressLog.findMany({
      where: {
        profileId: profile.id,
        ...dateFilter,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error("პროგრესის ლოგების მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ახალი პროგრესის ლოგის შექმნა
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
    const validationResult = ProgressLogSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "არასწორი მოთხოვნის პარამეტრები", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { date, weight, mood, energy, sleep, notes, planId } = validationResult.data;
    
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
    
    // ვამოწმებთ არსებობს თუ არა უკვე პროგრესის ლოგი ამ თარიღისთვის
    const existingLog = await prisma.progressLog.findFirst({
      where: {
        profileId: profile.id,
        date: new Date(date),
      },
    });
    
    let progressLog;
    
    if (existingLog) {
      // განვაახლოთ არსებული ლოგი
      progressLog = await prisma.progressLog.update({
        where: { id: existingLog.id },
        data: {
          weight,
          mood,
          energy,
          sleep,
          notes,
          planId,
        },
      });
    } else {
      // შევქმნათ ახალი ლოგი
      progressLog = await prisma.progressLog.create({
        data: {
          profileId: profile.id,
          date: new Date(date),
          weight,
          mood,
          energy,
          sleep,
          notes,
          planId,
        },
      });
    }
    
    return NextResponse.json({
      message: existingLog ? "პროგრესის ლოგი განახლებულია" : "პროგრესის ლოგი შექმნილია",
      progressLog
    });
  } catch (error) {
    console.error("პროგრესის ლოგის შენახვის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}

// პროგრესის ანალიზის მიღება
export async function PUT(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { startDate, endDate } = body;
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "საწყისი და საბოლოო თარიღები აუცილებელია" },
        { status: 400 }
      );
    }
    
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
    
    // ვიღებთ პროგრესის ლოგებს მითითებული პერიოდისთვის
    const logs = await prisma.progressLog.findMany({
      where: {
        profileId: profile.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    if (logs.length === 0) {
      return NextResponse.json(
        { error: "პროგრესის ლოგები ვერ მოიძებნა მითითებული პერიოდისთვის" },
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
    };
    
    // მოვამზადოთ ლოგების მონაცემები OpenAI-სთვის
    const logsData = logs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      weight: log.weight,
      mood: log.mood,
      energy: log.energy,
      sleep: log.sleep,
      notes: log.notes,
    }));
    
    // პროგრესის ანალიზი OpenAI-ით
    const analysis = await analyzeProgress({
      profile: profileData,
      logs: logsData,
    });
    
    // შევინახოთ მოტივაციური შეტყობინება უახლეს ლოგში (თუ არსებობს)
    if (analysis.motivationalMessage && logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      await prisma.progressLog.update({
        where: { id: latestLog.id },
        data: {
          aiMessage: analysis.motivationalMessage,
        },
      });
    }
    
    return NextResponse.json({
      message: "პროგრესის ანალიზი წარმატებით შეიქმნა",
      analysis
    });
  } catch (error) {
    console.error("პროგრესის ანალიზის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}

// პროგრესის ლოგის წაშლა
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("logId");

  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }

  if (!logId) {
    return NextResponse.json(
      { error: "ლოგის ID აუცილებელია" },
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

    // ვამოწმებთ, რომ ლოგი ეკუთვნის ამ მომხმარებელს
    const log = await prisma.progressLog.findFirst({
      where: {
        id: parseInt(logId),
        profileId: profile.id,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: "ლოგი ვერ მოიძებნა ან არ გეკუთვნით" },
        { status: 404 }
      );
    }

    // წავშალოთ ლოგი
    await prisma.progressLog.delete({
      where: { id: log.id },
    });

    return NextResponse.json({ message: "პროგრესის ლოგი წარმატებით წაიშალა" });
  } catch (error) {
    console.error("პროგრესის ლოგის წაშლის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}