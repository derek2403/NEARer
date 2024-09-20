"use client";

import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

// Circle component to display the PNG images
const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div ref={ref} className={`z-10 flex h-12 w-12 items-center justify-center ${className}`}>
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Staking() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);

  return (
    <div
      className="relative flex w-4/5 m-auto  items-center justify-center overflow-hidden rounded-lg p-10"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          <Circle ref={div1Ref}>
            <img src="/path/to/user.png" alt="User" className="h-12 w-12" />
          </Circle>
          <Circle ref={div2Ref}>
            <img src="/path/to/openai.png" alt="OpenAI" className="h-12 w-12" />
          </Circle>
        </div>
      </div>

      {/* Animated Beams between the circles */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
      />
    </div>
  );
}