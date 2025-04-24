"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // სახელმწიფოს ინიციალიზაცია
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // შევამოწმოთ ლოკალური მეხსიერება ჩატვირთვისას
  useEffect(() => {
    try {
      // შევამოწმოთ, ხელმისაწვდომია თუ არა localStorage
      if (typeof window === 'undefined') {
        return;
      }

      // ვნახოთ, არის თუ არა უკვე რაიმე შენახული
      const item = window.localStorage.getItem(key);
      // თუ არსებობს, გამოვიყენოთ ის, წინააღმდეგ შემთხვევაში საწყისი მნიშვნელობა
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      // თუ შეცდომაა, გამოვიყენოთ საწყისი მნიშვნელობა
      console.error('ლოკალური მეხსიერებიდან წაკითხვის შეცდომა:', error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // ფუნქცია მნიშვნელობის განახლებისთვის
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // შევამოწმოთ, ხელმისაწვდომია თუ არა localStorage
      if (typeof window === 'undefined') {
        return;
      }

      // ახალი მნიშვნელობის მიღება (ფუნქცია ან პირდაპირი მნიშვნელობა)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // მნიშვნელობის განახლება სახელმწიფოში
      setStoredValue(valueToStore);
      
      // შევინახოთ ლოკალურ მეხსიერებაში
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('ლოკალურ მეხსიერებაში შენახვის შეცდომა:', error);
    }
  };

  return [storedValue, setValue];
}