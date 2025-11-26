'use client';

import { useEffect, useRef } from 'react';

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    const numberOfStars = 200;

    // Initialize stars
    for (let i = 0; i < numberOfStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Update position
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        // Draw star with orange, sky blue, or white colors
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Mix of colors: 40% white, 30% sky blue, 30% orange
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.7})`;
        } else if (colorChoice < 0.7) {
          ctx.fillStyle = `rgba(14, 165, 233, ${Math.random() * 0.4 + 0.6})`; // Sky blue
        } else {
          ctx.fillStyle = `rgba(255, 140, 66, ${Math.random() * 0.4 + 0.6})`; // Orange
        }
        ctx.fill();

        // Optional: Add glow effect
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 bg-transparent"
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-radial from-sky-400/10 via-orange-500/5 to-transparent opacity-50" />
    </>
  );
};

export default StarryBackground;