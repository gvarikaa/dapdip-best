// src/components/Background/CoverEditor.tsx
"use client";

import React, { useState } from "react";
import CoolBackground from "./CoolBackground";

type CoverEditorProps = {
  username: string;
  initialType?: string;
  onTypeChange?: (type: string) => void;
  onFileChange?: (file: File) => void;
};

const CoverEditor: React.FC<CoverEditorProps> = ({
  username,
  initialType = "gradient",
  onTypeChange,
  onFileChange,
}) => {
  const [selectedType, setSelectedType] = useState(initialType);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    if (onTypeChange) onTypeChange(type);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileChange) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3">პროფილის ქოვერი</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {["gradient", "triangles", "particles", "waves"].map((type) => (
          <div
            key={type}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
              selectedType === type ? "border-iconBlue" : "border-transparent"
            }`}
            onClick={() => handleTypeSelect(type)}
          >
            <div className="h-24 relative">
              <CoolBackground
                type={type as any}
                username={username}
                className="w-full h-full"
              />
            </div>
            <p className="text-center mt-1 text-sm capitalize">{type}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-textGray mb-2">ან ატვირთეთ საკუთარი:</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm bg-inputGray border border-borderGray rounded-md p-2"
        />
      </div>
    </div>
  );
};

export default CoverEditor;