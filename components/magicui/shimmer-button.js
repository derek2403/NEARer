// components/magicui/shimmer-button.js
import React from 'react';

export default function ShimmerButton({
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  borderRadius = '100px',
  shimmerDuration = '3s',
  background = 'rgba(0, 0, 0, 1)',
  className = '',
  children,
}) {
  return (
    <button
      className={`relative overflow-hidden px-6 py-3 ${className}`}
      style={{
        borderRadius: borderRadius,
        background: background,
      }}
    >
      {children}
      <div
        className="absolute inset-0 border border-solid"
        style={{
          borderColor: shimmerColor,
          borderRadius: borderRadius,
          animation: `spin-around ${shimmerDuration} linear infinite`,
        }}
      />
    </button>
  );
}