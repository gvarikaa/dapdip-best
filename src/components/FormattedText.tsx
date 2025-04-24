// src/components/FormattedText.tsx
"use client";

import React from 'react';
import Link from 'next/link';

type FormattedTextProps = {
  text: string;
};

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  if (!text) return null;

  // რეგულარული გამოსახულება ჰეშთეგების ამოსაცნობად
  const hashtagRegex = /#([\wა-ჰ]+)/g;
  
  // URL-ების ამოსაცნობი რეგულარული გამოსახულება (სხვა ტიპის ბმულებისთვის)
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // ტექსტის დაყოფა ნაწილებად და ჰეშთეგების/ბმულების დამუშავება
  const renderFormattedText = () => {
    // ვაერთიანებთ ორივე რეგულარულ გამოსახულებას
    const combinedRegex = new RegExp(`${hashtagRegex.source}|${urlRegex.source}`, 'g');
    
    // ვყოფთ ტექსტს ნაწილებად
    const parts = text.split(combinedRegex);
    
    // ვპოულობთ ყველა მატჩს
    const matches = text.match(combinedRegex) || [];
    
    // შედეგი: ნაწილები, რომლებიც განსხვავებულად გამოისახება
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      // ვამატებთ ჩვეულებრივ ტექსტს
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
      
      // ვამატებთ მატჩს (ჰეშთეგს ან URL-ს), თუ არსებობს
      if (matches[i]) {
        if (matches[i].startsWith('#')) {
          const hashtag = matches[i].substring(1); // ვაშორებთ # სიმბოლოს
          result.push(
            <Link 
              key={`hashtag-${i}`} 
              href={`/hashtag/${hashtag.toLowerCase()}`} 
              className="text-iconBlue hover:underline"
            >
              {matches[i]}
            </Link>
          );
        } else if (matches[i].match(urlRegex)) {
          result.push(
            <a 
              key={`url-${i}`} 
              href={matches[i]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-iconBlue hover:underline"
            >
              {matches[i]}
            </a>
          );
        } else {
          result.push(<span key={`other-${i}`}>{matches[i]}</span>);
        }
      }
    }
    
    return result;
  };

  return <>{renderFormattedText()}</>;
};

export default FormattedText;