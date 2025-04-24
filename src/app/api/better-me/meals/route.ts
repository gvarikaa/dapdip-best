// src/app/api/better-me/meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateDailyMealPlan } from "@/utils/openai";
import { z } from "zod";

// კვების გეგმის მოთხოვნის სქემა
const MealRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD ფორმატი
  planId: z.number().optional(),
});

// კვების გეგმის მიღება
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
    
    // ვეძებთ კვების გეგმას ამ თარიღისთვის
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: new Date(dateParam),
        plan: {
          profileId: profile.id,
        },
      },
      include: {
        recipes: true,
        logs: true,
      },
    });
    
    if (!mealPlan) {
      return NextResponse.json(
        { error: "კვების გეგმა ამ თარიღისთვის ვერ მოიძებნა" },
        { status: 404 }
      );
    }
    
    // დავაფორმატოთ კვების გეგმის მონაცემები
    const formattedMealPlan = {
      ...mealPlan,
      meals: mealPlan.meals ? JSON.parse(mealPlan.meals) : {},
      macros: mealPlan.macros ? JSON.parse(mealPlan.macros) : {},
      groceryList: mealPlan.groceryList ? JSON.parse(mealPlan.groceryList) : [],
    };
    
    return NextResponse.json(formattedMealPlan);
  } catch (error) {
    console.error("კვების გეგმის მიღების შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა" },
      { status: 500 }
    );
  }
}

// ახალი კვების გეგმის შექმნა
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
    const validationResult = MealRequestSchema.safeParse(body);
    
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
    
    // ვამოწმებთ არსებობს თუ არა უკვე კვების გეგმა ამ თარიღისთვის
    const existingMealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: new Date(date),
        planId: plan.id,
      },
    });
    
    if (existingMealPlan) {
      return NextResponse.json(
        { 
          message: "კვების გეგმა ამ თარიღისთვის უკვე არსებობს", 
          mealPlan: {
            ...existingMealPlan,
            meals: existingMealPlan.meals ? JSON.parse(existingMealPlan.meals) : {},
            macros: existingMealPlan.macros ? JSON.parse(existingMealPlan.macros) : {},
            groceryList: existingMealPlan.groceryList ? JSON.parse(existingMealPlan.groceryList) : [],
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
      targetWeight: profile.targetWeight,
      goal: profile.goal,
      foodRestrictions: profile.foodRestrictions ? JSON.parse(profile.foodRestrictions) : [],
      dislikedFoods: profile.dislikedFoods ? JSON.parse(profile.dislikedFoods) : [],
      activityLevel: profile.activityLevel,
    };
    
    // კვების გეგმის გენერაცია OpenAI-ით
    const mealPlanData = await generateDailyMealPlan({
      profile: profileData,
      date,
      planDuration: plan.duration as '1_week' | '1_month' | '3_months',
    });
    
    // კვების გეგმის შენახვა ბაზაში
    const newMealPlan = await prisma.mealPlan.create({
      data: {
        planId: plan.id,
        date: new Date(date),
        meals: JSON.stringify(mealPlanData.meals),
        calories: mealPlanData.calories,
        macros: JSON.stringify(mealPlanData.macros),
        groceryList: JSON.stringify(mealPlanData.groceryList || []),
        estimatedCost: mealPlanData.estimatedCost,
      },
    });
    
    // რეცეპტების შენახვა (თუ არის)
    if (mealPlanData.meals) {
      const mealTypes = Object.keys(mealPlanData.meals);
      
      for (const mealType of mealTypes) {
        const meal = mealPlanData.meals[mealType];
        
        if (meal && meal.recipe) {
          // შევინახოთ რეცეპტი
          await prisma.recipe.create({
            data: {
              mealPlanId: newMealPlan.id,
              name: meal.name,
              description: `${mealType} - ${meal.name}`,
              ingredients: JSON.stringify(meal.foods),
              instructions: meal.recipe,
              calories: meal.calories,
            },
          });
        }
      }
    }
    
    // დავაფორმატოთ კვების გეგმის მონაცემები
    const formattedMealPlan = {
      ...newMealPlan,
      meals: mealPlanData.meals || {},
      macros: mealPlanData.macros || {},
      groceryList: mealPlanData.groceryList || [],
    };
    
    return NextResponse.json({
      message: "კვების გეგმა წარმატებით შეიქმნა",
      mealPlan: formattedMealPlan
    });
  } catch (error) {
    console.error("კვების გეგმის შექმნის შეცდომა:", error);
    return NextResponse.json(
      { error: "სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით." },
      { status: 500 }
    );
  }
}