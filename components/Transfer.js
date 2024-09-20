"use client";

import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

// Circle component with forwardRef
const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </div>
  );
});

// Transfer component
export default function Transfer() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);

  return (
    <div
      className="relative flex w-4/5 m-auto items-center justify-center overflow-hidden   p-10 l"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          {/* Placeholder image in the first circle */}
          <Circle ref={div1Ref}>
            <img
              src="/path/to/placeholder.png" // Replace with your placeholder image path
              alt="User Icon"
              className="h-8 w-8"
            />
          </Circle>

          {/* Placeholder image in the second circle */}
          <Circle ref={div2Ref}>
            <img
              src="/path/to/placeholder.png" // Replace with your placeholder image path
              alt="OpenAI Icon"
              className="h-8 w-8"
            />
          </Circle>
        </div>
      </div>

      {/* Animated transfer beam */}
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
      />
    </div>
  );
}