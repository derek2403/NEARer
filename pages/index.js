// pages/index.js
import Meteors from "../components/magicui/meteors";
import ShimmerButton from "../components/magicui/shimmer-button";
import Globe from "../components/magicui/globe";

export default function HomePage() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-gradient-to-b from-indigo-900 to-black overflow-hidden">
      {/* Meteors Background */}
      <div className="absolute inset-0 z-0">
        <Meteors number={50} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-7xl flex-col md:flex-row items-center justify-between px-8">
        {/* Left Side: Heading and Button */}
        <div className="flex flex-col items-center md:items-start space-y-6 mb-8 md:mb-0">
          <h1 className="text-5xl md:text-6xl font-bold text-white text-center md:text-left">Welcome to<br />My Page</h1>
          <ShimmerButton 
            className="shadow-2xl" 
            background="rgba(59, 130, 246, 0.8)"
            shimmerColor="rgba(255, 255, 255, 0.8)"
          >
            <span className="text-lg font-medium leading-none tracking-tight text-white">
              Explore Now
            </span>
          </ShimmerButton>
        </div>

        {/* Right Side: Globe */}
        <div className="flex items-center justify-center w-full md:w-1/2 h-64 md:h-96">
          <Globe className="w-full h-full" config={{
            globeColor: [0.3, 0.6, 1],
            glowColor: [0.7, 0.7, 1],
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            dark: 0,
            diffuse: 1.2,
          }} />
        </div>
      </div>
    </div>
  );
}