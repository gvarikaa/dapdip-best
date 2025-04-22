// src/app/test-avatars/page.tsx
"use client";

import { BigHead } from "@bigheads/core";

export default function TestAvatarsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">BigHeads ტესტი</h1>
      
      <div className="w-64 h-64 mx-auto">
        <BigHead
          accessory="roundGlasses"
          body="chest"
          circleColor="blue"
          clothing="shirt"
          clothingColor="green"
          eyebrows="raised"
          eyes="happy"
          facialHair="none"
          graphic="react"
          hair="short"
          hairColor="black"
          hat="none"
          hatColor="red"
          lashes={false}
          lipColor="purple"
          mouth="smile"
          skinTone="light"
        />
      </div>
    </div>
  );
}