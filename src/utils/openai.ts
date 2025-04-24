// src/utils/openai.ts
import OpenAI from 'openai';

// OpenAI ინსტანსის შექმნა
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HealthProfileData {
  gender?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  goal?: string | null;
  timeline?: string | null;
  foodRestrictions?: string[] | null;
  dislikedFoods?: string[] | null;
  symptoms?: Record<string, boolean> | null;
  activityLevel?: string | null;
  exercisePreference?: string | null;
}

export interface WellnessPlanRequest {
  profile: HealthProfileData;
  duration: '1_week' | '1_month' | '3_months';
}

export interface MealPlanRequest {
  profile: HealthProfileData;
  date: string;
  planDuration: '1_week' | '1_month' | '3_months';
}

export interface RecipeRequest {
  ingredients: string[];
  mealType: string;
  calories: number;
  restrictions: string[];
}

export interface ExercisePlanRequest {
  profile: HealthProfileData;
  date: string;
  planDuration: '1_week' | '1_month' | '3_months';
}

export interface ProgressAnalysisRequest {
  profile: HealthProfileData;
  logs: Array<{
    date: string;
    weight?: number | null;
    mood?: string | null;
    energy?: number | null;
    sleep?: number | null;
    notes?: string | null;
  }>;
}

export interface ConsultationRequest {
  profile: HealthProfileData;
  question: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * პერსონალიზებული ველნეს გეგმის გენერირება AI-ის გამოყენებით
 */
export async function generateWellnessPlan(data: WellnessPlanRequest) {
  try {
    const prompt = `
      შექმენი ველნეს გეგმა შემდეგი პროფილის მქონე ადამიანისთვის:
      
      - სქესი: ${data.profile.gender || 'დაუზუსტებელი'}
      - ასაკი: ${data.profile.age || 'დაუზუსტებელი'}
      - სიმაღლე: ${data.profile.height ? `${data.profile.height} სმ` : 'დაუზუსტებელი'}
      - წონა: ${data.profile.weight ? `${data.profile.weight} კგ` : 'დაუზუსტებელი'}
      - სამიზნე წონა: ${data.profile.targetWeight ? `${data.profile.targetWeight} კგ` : 'დაუზუსტებელი'}
      - მიზანი: ${data.profile.goal || 'ჯანმრთელობის გაუმჯობესება'}
      - საკვები შეზღუდვები: ${data.profile.foodRestrictions ? data.profile.foodRestrictions.join(', ') : 'არცერთი'}
      - არ მოსწონს: ${data.profile.dislikedFoods ? data.profile.dislikedFoods.join(', ') : 'არცერთი'}
      - სიმპტომები: ${data.profile.symptoms ? Object.entries(data.profile.symptoms)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ') : 'არცერთი'}
      - აქტივობის დონე: ${data.profile.activityLevel || 'ზომიერი'}
      - ვარჯიშის პრეფერენცია: ${data.profile.exercisePreference || 'არცერთი'}
      
      გთხოვ შეუქმნა ამ პიროვნებას ${data.duration} ხანგრძლივობის დეტალური ველნეს გეგმა.
      
      გეგმა უნდა მოიცავდეს:
      1. მოკლე შესავალს ამ გეგმის მიზნებზე და მოსალოდნელ შედეგებზე
      2. კვების გეგმას (რა უნდა ჭამოს ყოველდღიურად)
      3. ვარჯიშის რუტინას (რა ტიპის აქტივობები უნდა გააკეთოს)
      4. ცხოვრების სტილის რეკომენდაციებს (ძილი, წყლის მიღება, სტრესის მართვა)
      5. პროგრესის თვალყურის დევნების რჩევებს
      
      დააფორმატე პასუხი JSON-ად შემდეგი სტრუქტურით:
      {
        "title": "გეგმის სათაური",
        "overview": "გეგმის მოკლე აღწერა",
        "duration": "გეგმის ხანგრძლივობა",
        "goalDescription": "დეტალური აღწერა რას მიაღწევს ამ გეგმით",
        "nutritionOverview": "კვების ძირითადი პრინციპები",
        "exerciseOverview": "ვარჯიშის ძირითადი პრინციპები",
        "weeklyBreakdown": [
          {
            "week": 1,
            "goals": ["მიზანი 1", "მიზანი 2"],
            "nutritionFocus": "კვების ფოკუსი",
            "exerciseFocus": "ვარჯიშის ფოკუსი"
          }
        ],
        "lifestyleTips": ["რჩევა 1", "რჩევა 2"],
        "progressTracking": {
          "metrics": ["მეტრიკა 1", "მეტრიკა 2"],
          "checkpoints": ["მონიშვნის წერტილი 1", "მონიშვნის წერტილი 2"]
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "შენ ხარ AI ასისტენტი, რომელიც სპეციალიზდება ჯანსაღი ცხოვრების წესის, კვების და ვარჯიშის გეგმების შექმნაში. გთხოვ, მოგვაწოდო მეცნიერულად დასაბუთებული და პერსონალიზებული რჩევები."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("ველნეს გეგმის გენერირება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

/**
 * დღიური კვების გეგმის და რეცეპტების გენერირება
 */
export async function generateDailyMealPlan(data: MealPlanRequest) {
  try {
    const prompt = `
      შექმენი დღიური კვების გეგმა შემდეგი პროფილის მქონე ადამიანისთვის:
      
      - სქესი: ${data.profile.gender || 'დაუზუსტებელი'}
      - ასაკი: ${data.profile.age || 'დაუზუსტებელი'}
      - სიმაღლე: ${data.profile.height ? `${data.profile.height} სმ` : 'დაუზუსტებელი'}
      - წონა: ${data.profile.weight ? `${data.profile.weight} კგ` : 'დაუზუსტებელი'}
      - სამიზნე წონა: ${data.profile.targetWeight ? `${data.profile.targetWeight} კგ` : 'დაუზუსტებელი'}
      - მიზანი: ${data.profile.goal || 'ჯანმრთელობის გაუმჯობესება'}
      - საკვები შეზღუდვები: ${data.profile.foodRestrictions ? data.profile.foodRestrictions.join(', ') : 'არცერთი'}
      - არ მოსწონს: ${data.profile.dislikedFoods ? data.profile.dislikedFoods.join(', ') : 'არცერთი'}
      
      გთხოვ შექმნა კვების გეგმა თარიღისთვის: ${data.date}
      
      დააფორმატე პასუხი JSON-ად შემდეგი სტრუქტურით:
      {
        "date": "თარიღი",
        "calories": კალორიების ჯამური რაოდენობა,
        "macros": {
          "protein": ცილების გრამები,
          "carbs": ნახშირწყლების გრამები,
          "fat": ცხიმების გრამები
        },
        "meals": {
          "breakfast": {
            "name": "საუზმის დასახელება",
            "foods": ["საკვები 1", "საკვები 2"],
            "calories": კალორიები,
            "recipe": "მოკლე რეცეპტი"
          },
          "lunch": {...},
          "dinner": {...},
          "snacks": [...]
        },
        "waterIntake": რამდენი ლიტრი წყალი,
        "groceryList": ["პროდუქტი 1", "პროდუქტი 2"],
        "estimatedCost": სავარაუდო ღირებულება ლარებში,
        "tips": ["რჩევა 1", "რჩევა 2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "შენ ხარ AI დიეტოლოგი, რომელიც სპეციალიზდება ჯანსაღი და გემრიელი კვების გეგმების შექმნაში. გთხოვ, მოგვაწოდო მეცნიერულად დასაბუთებული და პერსონალიზებული რჩევები."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("კვების გეგმის გენერირება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

/**
 * დღიური ვარჯიშის გეგმის გენერირება
 */
export async function generateDailyExercisePlan(data: ExercisePlanRequest) {
  try {
    const prompt = `
      შექმენი დღიური ვარჯიშის გეგმა შემდეგი პროფილის მქონე ადამიანისთვის:
      
      - სქესი: ${data.profile.gender || 'დაუზუსტებელი'}
      - ასაკი: ${data.profile.age || 'დაუზუსტებელი'}
      - სიმაღლე: ${data.profile.height ? `${data.profile.height} სმ` : 'დაუზუსტებელი'}
      - წონა: ${data.profile.weight ? `${data.profile.weight} კგ` : 'დაუზუსტებელი'}
      - მიზანი: ${data.profile.goal || 'ჯანმრთელობის გაუმჯობესება'}
      - აქტივობის დონე: ${data.profile.activityLevel || 'ზომიერი'}
      - ვარჯიშის პრეფერენცია: ${data.profile.exercisePreference || 'შერეული'}
      
      გთხოვ შექმნა ვარჯიშის გეგმა თარიღისთვის: ${data.date}
      
      დააფორმატე პასუხი JSON-ად შემდეგი სტრუქტურით:
      {
        "date": "თარიღი",
        "duration": ხანგრძლივობა წუთებში,
        "intensity": "ინტენსივობა (light, moderate, intense)",
        "exercises": [
          {
            "name": "ვარჯიშის დასახელება",
            "type": "ვარჯიშის ტიპი (cardio, strength, flexibility)",
            "duration": ხანგრძლივობა წუთებში,
            "sets": უნდა გაკეთდეს რამდენი სეტი (თუ რელევანტურია),
            "reps": რამდენი გამეორება (თუ რელევანტურია),
            "description": "ვარჯიშის აღწერა",
            "alternativeExercise": "ალტერნატიული ვარჯიში"
          }
        ],
        "warmup": "გახურების ვარჯიშები",
        "cooldown": "გაგრილების ვარჯიშები",
        "estimatedCaloriesBurned": დაახლოებით დახარჯული კალორიები,
        "tips": ["რჩევა 1", "რჩევა 2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "შენ ხარ AI ფიტნეს ტრენერი, რომელიც სპეციალიზდება პერსონალური ვარჯიშის გეგმების შექმნაში. გთხოვ, მოგვაწოდო მეცნიერულად დასაბუთებული და უსაფრთხო რჩევები."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("ვარჯიშის გეგმის გენერირება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

/**
 * დეტალური რეცეპტის გენერირება
 */
export async function generateRecipe(data: RecipeRequest) {
  try {
    const prompt = `
      გთხოვ შემიქმნა დეტალური რეცეპტი შემდეგი ინფორმაციის საფუძველზე:
      
      - ინგრედიენტები: ${data.ingredients.join(', ')}
      - კვების ტიპი: ${data.mealType}
      - სამიზნე კალორიები: ${data.calories}
      - შეზღუდვები: ${data.restrictions.join(', ') || 'არცერთი'}
      
      დააფორმატე პასუხი JSON-ად შემდეგი სტრუქტურით:
      {
        "name": "რეცეპტის დასახელება",
        "description": "რეცეპტის მოკლე აღწერა",
        "prepTime": მომზადების დრო წუთებში,
        "cookTime": მომზადების დრო წუთებში,
        "servings": პორციების რაოდენობა,
        "difficulty": "სირთულე (easy, medium, hard)",
        "ingredients": [
          {
            "name": "ინგრედიენტის დასახელება",
            "amount": "რაოდენობა",
            "unit": "ერთეული (გრ, მლ, ც)"
          }
        ],
        "instructions": [
          "ინსტრუქცია 1",
          "ინსტრუქცია 2"
        ],
        "nutritionalInfo": {
          "calories": კალორიები პორციაზე,
          "protein": ცილა (გრ),
          "carbs": ნახშირწყლები (გრ),
          "fat": ცხიმი (გრ)
        },
        "tips": ["რჩევა 1", "რჩევა 2"],
        "variations": ["ვარიაცია 1", "ვარიაცია 2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "შენ ხარ AI შეფ-მზარეული, რომელიც სპეციალიზდება ჯანსაღი და გემრიელი რეცეპტების შექმნაში. გთხოვ, მოგვაწოდო დეტალური და მარტივად გასაგები ინსტრუქციები."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("რეცეპტის გენერირება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

/**
 * პროგრესის ანალიზი და მოტივაციური რჩევების გენერირება
 */
export async function analyzeProgress(data: ProgressAnalysisRequest) {
  try {
    const prompt = `
      გააანალიზე პროგრესი შემდეგი პროფილის მქონე ადამიანისთვის:
      
      - სქესი: ${data.profile.gender || 'დაუზუსტებელი'}
      - ასაკი: ${data.profile.age || 'დაუზუსტებელი'}
      - სიმაღლე: ${data.profile.height ? `${data.profile.height} სმ` : 'დაუზუსტებელი'}
      - წონა: ${data.profile.weight ? `${data.profile.weight} კგ` : 'დაუზუსტებელი'}
      - სამიზნე წონა: ${data.profile.targetWeight ? `${data.profile.targetWeight} კგ` : 'დაუზუსტებელი'}
      - მიზანი: ${data.profile.goal || 'ჯანმრთელობის გაუმჯობესება'}
      
      პროგრესის ჩანაწერები:
      ${data.logs.map(log => `
        - თარიღი: ${log.date}
        - წონა: ${log.weight || 'არ არის ჩაწერილი'}
        - განწყობა: ${log.mood || 'არ არის ჩაწერილი'}
        - ენერგია: ${log.energy !== undefined ? `${log.energy}/10` : 'არ არის ჩაწერილი'}
        - ძილი: ${log.sleep !== undefined ? `${log.sleep} საათი` : 'არ არის ჩაწერილი'}
        - შენიშვნები: ${log.notes || 'არ არის ჩაწერილი'}
      `).join('\n')}
      
      გთხოვთ გააანალიზოთ პროგრესი, გამოიტანოთ დასკვნები და მისცეთ მოტივაციური რჩევები.
      
      დააფორმატეთ პასუხი JSON-ად შემდეგი სტრუქტურით:
      {
        "summary": "პროგრესის მოკლე შეჯამება",
        "trends": {
          "weight": "წონის ტრენდი",
          "mood": "განწყობის ტრენდი",
          "energy": "ენერგიის ტრენდი",
          "sleep": "ძილის ტრენდი"
        },
        "achievements": ["მიღწევა 1", "მიღწევა 2"],
        "challengeAreas": ["გამოწვევა 1", "გამოწვევა 2"],
        "recommendations": ["რეკომენდაცია 1", "რეკომენდაცია 2"],
        "motivationalMessage": "მოტივაციური შეტყობინება",
        "nextSteps": ["შემდეგი ნაბიჯი 1", "შემდეგი ნაბიჯი 2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "შენ ხარ AI ჯანმრთელობის მრჩეველი, რომელიც სპეციალიზდება პროგრესის ანალიზში და პერსონალიზებული მოტივაციური რჩევების მიცემაში. გთხოვ, მოგვაწოდო პოზიტიური, მაგრამ რეალისტური შეფასება."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("პროგრესის ანალიზი ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

/**
 * კონსულტაცია AI ასისტენტთან ჯანმრთელობისა და ველნესის საკითხებზე
 */
export async function getConsultation(data: ConsultationRequest) {
  try {
    // ვქმნით საუბრის ისტორიას ChatGPT-სთვის
    const messages = [
      {
        role: "system",
        content: `
          შენ ხარ Better Me პლატფორმის AI ჯანმრთელობის მრჩეველი, რომელიც ეხმარება მომხმარებლებს ჯანსაღი ცხოვრების წესის დანერგვაში. 
          
          მომხმარებლის პროფილი:
          - სქესი: ${data.profile.gender || 'დაუზუსტებელი'}
          - ასაკი: ${data.profile.age || 'დაუზუსტებელი'}
          - სიმაღლე: ${data.profile.height ? `${data.profile.height} სმ` : 'დაუზუსტებელი'}
          - წონა: ${data.profile.weight ? `${data.profile.weight} კგ` : 'დაუზუსტებელი'}
          - მიზანი: ${data.profile.goal || 'ჯანმრთელობის გაუმჯობესება'}
          
          მოგვაწოდე მეცნიერულად დასაბუთებული და პერსონალიზებული რჩევები. თუ შეკითხვა სცდება შენი კომპეტენციის ფარგლებს, მიუთითე რომ ეს საკითხი უნდა განიხილონ კვალიფიციურ სამედიცინო პერსონალთან.
          
          პასუხები უნდა იყოს მეგობრული, მოტივაციური და პოზიტიური. სადაც შესაძლებელია, მიეცი კონკრეტული და პრაქტიკული რჩევები.
        `
      }
    ] as Array<{ role: "system" | "user" | "assistant"; content: string }>;

    // თუ არის წინა საუბრის ისტორია, დავამატოთ
    if (data.history && data.history.length > 0) {
      messages.push(...data.history);
    }

    // დავამატოთ მიმდინარე შეკითხვა
    messages.push({
      role: "user",
      content: data.question
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages
    });

    return {
      answer: response.choices[0].message.content,
      conversation: [
        ...(data.history || []),
        { role: "user", content: data.question },
        { role: "assistant", content: response.choices[0].message.content || "" }
      ]
    };
  } catch (error) {
    console.error("OpenAI API ცდომილება:", error);
    throw new Error("კონსულტაციის მიღება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.");
  }
}

export default openai;