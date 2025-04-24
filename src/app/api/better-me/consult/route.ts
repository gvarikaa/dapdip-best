// src/app/api/better-me/consult/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { getConsultation } from "@/utils/openai";
import { z } from "zod";

// კონსულტაციის მოთხოვნის სქემა
const ConsultationRequestSchema = z.object({
  question: z.string().min(3).max(2000),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional(),
});

// წინა კონსულტაციების მიღება
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  
  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზაცია საჭიროა" },
      { status: 401 }
    );
  }
  
  try {
    // ვიღებთ კონსულტაციების ისტორიას
    const consultations = await prisma.aIConsultation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    // ვითვლით სრულ რაოდენობას
    const total = await prisma.aIConsultation.count({
      where: {
        userId,
      },
    });
    
    return NextResponse.json({
      consultations,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("კონსულტაციების მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ახალი კონსულტაციის მიღება
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
    const validationResult = ConsultationRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "არასწორი მოთხოვნის პარამეტრები", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { question, history } = validationResult.data;
    
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
      foodRestrictions: profile.foodRestrictions ? JSON.parse(profile.foodRestrictions) : [],
      dislikedFoods: profile.dislikedFoods ? JSON.parse(profile.dislikedFoods) : [],
      symptoms: profile.symptoms ? JSON.parse(profile.symptoms) : {},
      activityLevel: profile.activityLevel,
      exercisePreference: profile.exercisePreference,
    };
    
    // კონსულტაციის მიღება OpenAI-დან
    const consultationResult = await getConsultation({
      profile: profileData,
      question,
      history,
    });
    
    // შევინახოთ კონსულტაცია ბაზაში
    const consultation = await prisma.aIConsultation.create({
      data: {
        userId,
        question,
        answer: consultationResult.answer,
        topic: detectTopic(question), // ფუნქცია რომელიც განსაზღვრავს თემას
      },
    });
    
    return NextResponse.json({
      message: "კონსულტაცია წარმატებით მიღებულია",
      consultation: {
        ...consultation,
        conversation: consultationResult.conversation,
      }
    });
  } catch (error) {
    console.error("კონსულტაციის მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}

/**
 * შეკითხვის თემის განსაზღვრა საკვანძო სიტყვებზე დაყრდნობით
 */
function detectTopic(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  const topics = {
    nutrition: ['საკვები', 'კვება', 'დიეტა', 'ვიტამინი', 'კალორიები', 'პროტეინი', 'ცილა', 'ნახშირწყლები', 'ცხიმი', 'ჭამა'],
    exercise: ['ვარჯიში', 'სპორტი', 'ფიტნესი', 'კარდიო', 'კუნთები', 'ძალოსნობა', 'იოგა', 'სირბილი'],
    sleep: ['ძილი', 'დასვენება', 'ინსომნია', 'უძილობა', 'დაღლილობა'],
    mental: ['სტრესი', 'შფოთვა', 'დეპრესია', 'მედიტაცია', 'ფსიქიკური', 'მენტალური', 'ემოციური'],
    weight: ['წონა', 'გასუქება', 'გახდომა', 'კილოგრამი', 'კგ'],
  };
  
  // ვამოწმებთ თითოეულ თემაში რამდენი საკვანძო სიტყვა მოიძებნება
  const scores = Object.entries(topics).map(([topic, keywords]) => {
    const score = keywords.filter(keyword => lowerQuestion.includes(keyword)).length;
    return { topic, score };
  });
  
  // ვარჩევთ უმაღლესი ქულის მქონე თემას
  scores.sort((a, b) => b.score - a.score);
  
  // თუ ვერცერთი თემა ვერ მოიძებნა, ვაბრუნებთ "general"
  return scores[0].score > 0 ? scores[0].topic : "general";
}