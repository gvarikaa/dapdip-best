// src/app/api/user/cover/route.ts
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/utils";

export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზებული არ ხართ" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { coverType, coverUrl } = body;
    
    // მომხმარებლის განახლება
    await prisma.user.update({
      where: { id: userId },
      data: { 
        cover: coverUrl,
        // მომავალში შეგიძლიათ შეინახოთ coverType სქემაში
      }
    });
    
    return NextResponse.json({ 
      message: "ქოვერი განახლებულია" 
    });
  } catch (error) {
    console.error("ქოვერის განახლების შეცდომა:", error);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}

// მეთოდი ქოვერის ფაილის ატვირთვისთვის
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "ავტორიზებული არ ხართ" },
      { status: 401 }
    );
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "ფაილი არ არის მითითებული" },
        { status: 400 }
      );
    }
    
    // ფაილის ბუფერად გარდაქმნა
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ფაილის ატვირთვა ImageKit-ში
    const uploadResult = await new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer,
          fileName: file.name,
          folder: "/covers",
        },
        function (error, result) {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    // მივიღოთ ფაილის URL
    let coverUrl = null;
    if (uploadResult && typeof uploadResult === 'object' && 'url' in uploadResult) {
      coverUrl = uploadResult.url as string;
      
      // მომხმარებლის განახლება
      await prisma.user.update({
        where: { id: userId },
        data: { cover: coverUrl }
      });
    }
    
    return NextResponse.json({ 
      message: "ქოვერი ატვირთულია",
      coverUrl 
    });
  } catch (error) {
    console.error("ქოვერის ატვირთვის შეცდომა:", error);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}