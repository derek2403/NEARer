"use client";

import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

// Circle component with forwardRef and PNG image as placeholder
const Circle = forwardRef(({ className, imageSrc, altText }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
    >
      <img src={imageSrc} alt={altText} className="h-8 w-8" />
    </div>
  );
});

Circle.displayName = "Circle";

// Staking component with multiple PNG placeholders and beams
export default function ListWallet() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  return (
    <div
      className="relative flex h-[500px] w-4/5 m-auto items-center justify-center overflow-hidden  p-10 "
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          {/* PNG image placeholders */}
          <Circle
            ref={div1Ref}
            imageSrc="/path/to/first-image.png"
            altText="User Icon"
          />
          <Circle
            ref={div2Ref}
            imageSrc="/path/to/second-image.png"
            altText="OpenAI Icon"
          />
        </div>
        <div className="flex flex-row justify-between">
          <Circle
            ref={div3Ref}
            imageSrc="/path/to/third-image.png"
            altText="Google Drive Icon"
          />
          <Circle
            ref={div4Ref}
            imageSrc="/path/to/fourth-image.png"
            altText="Messenger Icon"
          />
        </div>
      </div>

      {/* Animated Beams */}
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
      />
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
      />
    </div>
  );
}