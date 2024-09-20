// components/magicui/meteors.js
import React from 'react';

export default function Meteors({ number = 20 }) {
  const meteors = Array.from({ length: number });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {meteors.map((_, index) => (
        <div
          key={index}
          className="meteor absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full animate-meteor"
          style={{
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}