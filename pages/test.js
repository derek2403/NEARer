import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AnimatedBeamWithImages() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);

  return (
    <div
      className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          <Circle ref={div1Ref}>
            <img src="https://pbs.twimg.com/profile_images/1831456038098198528/jAnQxBc3_400x400.jpg" alt="User" className="h-14 w-14 rounded-full" />
          </Circle>
          <Circle ref={div2Ref}>
            <img src="https://static.vecteezy.com/system/resources/previews/022/227/364/original/openai-chatgpt-logo-icon-free-png.png" alt="OpenAI" className="h-14 w-14 rounded-full" />
          </Circle>
        </div>
      </div>
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
      />
      <AnimatedBeam
        duration={3}
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