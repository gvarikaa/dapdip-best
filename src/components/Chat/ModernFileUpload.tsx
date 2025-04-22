"use client";

import { useState, useRef } from 'react';

type ModernFileUploadProps = {
  onFileSelect: (file: File) => void;
};

const ModernFileUpload = ({ onFileSelect }: ModernFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // ვამოწმებთ ფაილის ზომას (მაქს. 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('ფაილი ძალიან დიდია. მაქსიმალური ზომაა 10MB');
        return;
      }

      setIsUploading(true);
      
      // იმიტირებული დაყოვნება, რეალური ატვირთვისთვის გამოიყენეთ API
      setTimeout(() => {
        onFileSelect(selectedFile);
        setIsUploading(false);
        // გავასუფთავოთ ინფუთი შემდეგი ატვირთვისთვის
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // ვამოწმებთ ფაილის ზომას (მაქს. 10MB)
      if (droppedFile.size > 10 * 1024 * 1024) {
        alert('ფაილი ძალიან დიდია. მაქსიმალური ზომაა 10MB');
        return;
      }
      
      setIsUploading(true);
      
      // იმიტირებული დაყოვნება
      setTimeout(() => {
        onFileSelect(droppedFile);
        setIsUploading(false);
      }, 500);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full"></div>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-300"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        )}
      </button>
      
      {isDragging && (
        <div className="absolute inset-0 -m-10 z-50 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-dashed border-blue-500 flex items-center justify-center">
          <div className="text-blue-500">ჩააგდეთ ფაილი აქ</div>
        </div>
      )}
    </div>
  );
};

export default ModernFileUpload;