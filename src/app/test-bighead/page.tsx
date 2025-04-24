// src/app/test-bighead/page.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// დინამიურად ჩავტვირთოთ BigHead კომპონენტი
const BigHead = dynamic(
  () => import('@bigheads/core').then(mod => mod.BigHead),
  { ssr: false }
);

export default function TestBigHeadPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">BigHead ტესტი</h1>
      
      <div className="w-64 h-64 mx-auto">
        {/* მარტივი BigHead კომპონენტი - "smile" შეცვლილია "openSmile"-ით */}
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
          mouth="openSmile"
          skinTone="light"
        />
      </div>
    </div>
  );
}