// src/components/Background/CoolBackground.tsx
"use client";

import React, { useEffect, useRef } from 'react';

type CoolBackgroundProps = {
  username: string;
  className?: string;
  type?: 'triangles' | 'gradient' | 'particles' | 'waves';
};

const CoolBackground: React.FC<CoolBackgroundProps> = ({ 
  username, 
  className = '',
  type = 'gradient'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ფუნქცია, რომელიც აგენერირებს შემთხვევით მაგრამ დეტერმინისტულ ციფრებს 
  // მომხმარებლის სახელზე დაფუძნებით
  const getRandomFromSeed = (seed: string, index: number, max: number) => {
    const charCodes = seed.split('').map(c => c.charCodeAt(0));
    const hash = charCodes.reduce((acc, curr, i) => acc + curr * (i + 1) * (index + 1), 0);
    return (hash % max) / max;
  };

  // გრადიენტის შექმნა
  const drawGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // მომხმარებლის სახელიდან ვიღებთ ფერებს
    const hue1 = Math.floor(getRandomFromSeed(username, 0, 360));
    const hue2 = Math.floor((hue1 + 40 + getRandomFromSeed(username, 1, 180)) % 360);
    const sat = 70 + getRandomFromSeed(username, 2, 30);
    const light1 = 40 + getRandomFromSeed(username, 3, 20);
    const light2 = 40 + getRandomFromSeed(username, 4, 20);
    
    const color1 = `hsl(${hue1}, ${sat}%, ${light1}%)`;
    const color2 = `hsl(${hue2}, ${sat}%, ${light2}%)`;
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // დავამატოთ რამდენიმე გამჭვირვალე წრე, რომ უფრო საინტერესო იყოს
    const circles = 5 + Math.floor(getRandomFromSeed(username, 5, 10));
    
    for (let i = 0; i < circles; i++) {
      const x = getRandomFromSeed(username, i * 2, width);
      const y = getRandomFromSeed(username, i * 2 + 1, height);
      const radius = Math.min(width, height) * (0.1 + getRandomFromSeed(username, i + 10, 0.4));
      
      const gradientCircle = ctx.createRadialGradient(
        x * width, y * height, 0,
        x * width, y * height, radius
      );
      
      const alpha = 0.1 + getRandomFromSeed(username, i + 20, 0.2);
      gradientCircle.addColorStop(0, `hsla(${(hue1 + i * 30) % 360}, ${sat}%, ${light1 + 10}%, ${alpha})`);
      gradientCircle.addColorStop(1, `hsla(${(hue2 + i * 30) % 360}, ${sat}%, ${light2 + 10}%, 0)`);
      
      ctx.fillStyle = gradientCircle;
      ctx.fillRect(0, 0, width, height);
    }
  };

  // სამკუთხედების პატერნის შექმნა
  const drawTriangles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // ფონის ფერი
    const hue = Math.floor(getRandomFromSeed(username, 0, 360));
    const sat = 40 + getRandomFromSeed(username, 1, 30);
    const light = 15 + getRandomFromSeed(username, 2, 15);
    
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    ctx.fillRect(0, 0, width, height);
    
    // სამკუთხედების რაოდენობა
    const triangleCount = 15 + Math.floor(getRandomFromSeed(username, 3, 25));
    
    for (let i = 0; i < triangleCount; i++) {
      // სამკუთხედის წვეროები
      const x1 = getRandomFromSeed(username, i * 3, width);
      const y1 = getRandomFromSeed(username, i * 3 + 1, height);
      
      const x2 = getRandomFromSeed(username, i * 3 + 2, width);
      const y2 = getRandomFromSeed(username, i * 3 + 3, height);
      
      const x3 = getRandomFromSeed(username, i * 3 + 4, width);
      const y3 = getRandomFromSeed(username, i * 3 + 5, height);
      
      // სამკუთხედის ფერი
      const triangleHue = (hue + getRandomFromSeed(username, i + 10, 60) - 30) % 360;
      const triangleSat = sat + getRandomFromSeed(username, i + 20, 20) - 10;
      const triangleLight = light + getRandomFromSeed(username, i + 30, 40);
      const alpha = 0.1 + getRandomFromSeed(username, i + 40, 0.4);
      
      ctx.fillStyle = `hsla(${triangleHue}, ${triangleSat}%, ${triangleLight}%, ${alpha})`;
      
      // ვხატავთ სამკუთხედს
      ctx.beginPath();
      ctx.moveTo(x1 * width, y1 * height);
      ctx.lineTo(x2 * width, y2 * height);
      ctx.lineTo(x3 * width, y3 * height);
      ctx.closePath();
      ctx.fill();
    }
  };

  // ნაწილაკების პატერნის შექმნა
  const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // ფონის ფერი
    const hue = Math.floor(getRandomFromSeed(username, 0, 360));
    const sat = 70 + getRandomFromSeed(username, 1, 30);
    const light = 5 + getRandomFromSeed(username, 2, 10);
    
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    ctx.fillRect(0, 0, width, height);
    
    // ნაწილაკების რაოდენობა
    const particleCount = 80 + Math.floor(getRandomFromSeed(username, 3, 100));
    
    for (let i = 0; i < particleCount; i++) {
      const x = getRandomFromSeed(username, i * 2, width);
      const y = getRandomFromSeed(username, i * 2 + 1, height);
      const radius = 1 + getRandomFromSeed(username, i + 10, 3);
      
      const particleHue = (hue + getRandomFromSeed(username, i + 20, 60) - 30) % 360;
      const particleSat = sat - 10 + getRandomFromSeed(username, i + 30, 20);
      const particleLight = 40 + getRandomFromSeed(username, i + 40, 50);
      
      ctx.fillStyle = `hsl(${particleHue}, ${particleSat}%, ${particleLight}%)`;
      
      ctx.beginPath();
      ctx.arc(x * width, y * height, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // დავამატოთ ხაზები ზოგიერთ ნაწილაკს შორის
      if (i % 4 === 0 && i < particleCount - 1) {
        const nextX = getRandomFromSeed(username, (i + 1) * 2, width);
        const nextY = getRandomFromSeed(username, (i + 1) * 2 + 1, height);
        
        ctx.strokeStyle = `hsla(${particleHue}, ${particleSat}%, ${particleLight}%, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x * width, y * height);
        ctx.lineTo(nextX * width, nextY * height);
        ctx.stroke();
      }
    }
  };

  // ტალღების პატერნის შექმნა
  const drawWaves = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // ფონის ფერი
    const hue1 = Math.floor(getRandomFromSeed(username, 0, 360));
    const hue2 = (hue1 + 180) % 360; // კომპლემენტარული ფერი
    const sat = 80 + getRandomFromSeed(username, 1, 20);
    const light = 40 + getRandomFromSeed(username, 2, 20);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `hsl(${hue1}, ${sat}%, ${light}%)`);
    gradient.addColorStop(1, `hsl(${hue2}, ${sat}%, ${light}%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // ტალღების რაოდენობა
    const waveCount = 3 + Math.floor(getRandomFromSeed(username, 3, 5));
    const waveHeight = height / 20;
    
    for (let w = 0; w < waveCount; w++) {
      const waveHue = (hue1 + w * 30) % 360;
      const waveSat = sat - 20 + getRandomFromSeed(username, w + 10, 40);
      const waveLight = light - 10 + getRandomFromSeed(username, w + 20, 20);
      const alpha = 0.1 + getRandomFromSeed(username, w + 30, 0.4);
      
      ctx.fillStyle = `hsla(${waveHue}, ${waveSat}%, ${waveLight}%, ${alpha})`;
      
      const waveOffset = getRandomFromSeed(username, w * 2, height);
      const frequency = 0.01 + getRandomFromSeed(username, w * 2 + 1, 0.05);
      
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x < width; x += 5) {
        const phase = getRandomFromSeed(username, w + 40, Math.PI * 2);
        const y = height - waveOffset - Math.sin(x * frequency + phase) * waveHeight;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // გავწმინდოთ კანვასი
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // დავხატოთ შესაბამისი ფონი
    switch (type) {
      case 'triangles':
        drawTriangles(ctx, canvas.width, canvas.height);
        break;
      case 'particles':
        drawParticles(ctx, canvas.width, canvas.height);
        break;
      case 'waves':
        drawWaves(ctx, canvas.width, canvas.height);
        break;
      case 'gradient':
      default:
        drawGradient(ctx, canvas.width, canvas.height);
        break;
    }
    
  }, [username, type]);

  // ეფექტი canvas-ის ზომის დასაყენებლად
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // ხელახლა დავხატოთ შინაარსი
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // გავწმინდოთ კანვასი
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // დავხატოთ შესაბამისი ფონი
      switch (type) {
        case 'triangles':
          drawTriangles(ctx, canvas.width, canvas.height);
          break;
        case 'particles':
          drawParticles(ctx, canvas.width, canvas.height);
          break;
        case 'waves':
          drawWaves(ctx, canvas.width, canvas.height);
          break;
        case 'gradient':
        default:
          drawGradient(ctx, canvas.width, canvas.height);
          break;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [username, type]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default CoolBackground;