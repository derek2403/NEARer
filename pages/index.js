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
          <h3 className="text-4xl md:text-6xl font-semibold text-green-500">
            Nearer
          </h3>
          <p className="text-base md:text-lg text-slate-700 my-4 md:my-6">
          All-in-one AI assistant powering seamless cross-chain operations with NEAR's chain signatures.
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
    src: "https://docs.layerzero.network/img/layerzerocover.jpeg",
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
    src: "https://file.coinexstatic.com/2023-11-16/BB3FDB00283C55B4C36B94CFAC0C3271.png",
  },
  {
    id: 8,
    src: "https://images.prismic.io/worldcoin-company-website/5ef465df-1bdd-4f4b-b8ce-b2c66b40de05_story-behind-new-worldcoin-logo-2.png?auto=compress,format",
  },
  {
    id: 9,
    src: "https://mms.businesswire.com/media/20231017097939/en/1916843/22/fulllogo.jpg",
  },
  {
    id: 10,
    src: "https://www.forbes.com/advisor/wp-content/uploads/2022/05/AVAX_-_brand_image.png",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1534126511673-b6899657816a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1536340343166-069a397c97e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1541627750162-42f40ebd063e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1511308070845-62e32f96d95a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
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