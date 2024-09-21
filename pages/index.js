"use client";

import Header from "@/components/Header";
import WorldIDLogin from "@/components/WorldID";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ShuffleHero = () => {
  return (
    <>
      <section className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
        <div>
          <span className="block mb-4 text-xs md:text-sm text-green-500 font-medium">
            Better every day
          </span>
          <h3 className="text-4xl md:text-6xl font-semibold">
            Let's change it up a bit
          </h3>
          <p className="text-base md:text-lg text-slate-700 my-4 md:my-6">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nam nobis
            in error repellat voluptatibus ad.
          </p>
          <WorldIDLogin/>
        </div>
        <ShuffleGrid />
      </section>
    </>
  );
};

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const squareData = [
  {
    id: 1,
    src: "https://logowik.com/content/uploads/images/phala-network4000.jpg",
  },
  {
    id: 2,
    src: "https://ethglobal.b-cdn.net/organizations/dkzkp/square-logo/default.png",
  },
  {
    id: 3,
    src: "https://pbs.twimg.com/profile_images/1831456038098198528/jAnQxBc3_400x400.jpg",
  },
  {
    id: 4,
    src: "https://cdn.pixabay.com/photo/2021/05/24/09/15/ethereum-logo-6278329_960_720.png",
  },
  {
    id: 5,
    src: "https://logowik.com/content/uploads/images/polygon-matic-icon3725.logowik.com.webp",
  },
  {
    id: 6,
    src: "https://cdn.dribbble.com/users/3144264/screenshots/17559079/2.png",
  },
  {
    id: 7,
    src: "https://ethglobal.b-cdn.net/organizations/x3xey/square-logo/default.png",
  },
  {
    id: 8,
    src: "https://images.prismic.io/worldcoin-company-website/5ef465df-1bdd-4f4b-b8ce-b2c66b40de05_story-behind-new-worldcoin-logo-2.png?auto=compress,format",
  },
  {
    id: 9,
    src: "https://ethglobal.b-cdn.net/organizations/yip67/square-logo/default.png",
  },
  {
    id: 10,
    src: "https://www.forbes.com/advisor/wp-content/uploads/2022/05/AVAX_-_brand_image.png",
  },
  {
    id: 11,
    src: "https://ethglobal.b-cdn.net/organizations/6wi0d/square-logo/default.png",
  },
  {
    id: 12,
    src: "https://ethglobal.b-cdn.net/organizations/46q4i/square-logo/default.png",
  },
  {
    id: 13,
    src: "https://ethglobal.b-cdn.net/organizations/1ijf8/square-logo/default.png",
  },
  {
    id: 14,
    src: "https://ethglobal.b-cdn.net/organizations/fxknf/square-logo/default.png",
  },
  {
    id: 15,
    src: "https://ethglobal.b-cdn.net/organizations/e3t1p/square-logo/default.png",
  },
  {
    id: 16,
    src: "https://ethglobal.b-cdn.net/organizations/4pn9u/square-logo/default.png",
  },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();

    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());

    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1.5">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex items-center justify-center flex-grow">
        <ShuffleHero />
      </div>
    </div>
  );
}