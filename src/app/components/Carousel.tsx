"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
// import onepiece from "@/public/covers/onepiece.jpg";
// import naruto from "@/public/covers/naruto.jpg";
// import dragonball from "@/public/covers/dragonball.jpg";

interface SlideItem {
  img: string; // Using `any` for simplicity with StaticImageData
  name: string;
  rating: string;
}

const list: SlideItem[] = [
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758189872/uploads/sxevyu3z8w7rb3vfsudp.avif", name: "One Piece", rating: "9.7" },
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758190467/uploads/wsnmtkqbbdnmmlkcgqc0.avif", name: "Dragon Ball", rating: "9.3" },
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758190322/uploads/uiijxsxxda7n15uhdngb.avif", name: "Naruto", rating: "8.9" },
];

const AUTO_SLIDE_INTERVAL = 3000; // Auto-slide interval in milliseconds

const Card = () => {
  const [index, setIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // // Auto-slide functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(() => {
        nextSlide();
      }, AUTO_SLIDE_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [index, isPaused]);

  // Keyboard navigation
  
  const prevSlide = (): void => {
    setIndex(index === 0 ? list.length - 1 : index - 1);
  };
  
  const nextSlide = (): void => {
    setIndex(index === list.length - 1 ? 0 : index + 1);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, nextSlide, prevSlide]);

  return (
    <div 
      className="relative w-full max-w-screen-lg mt-4 mx-auto overflow-hidden group"
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        <div className="absolute top-4 left-6 text-amber-100 font-serif font-bold bg-slate-700 p-2 md:p-4 rounded-md z-10">
          Trending Right Now
          <TrendingUp className='inline-block ml-2' />
        </div> 

        {list.map((item, i) => (
          <div 
            key={i} 
            className="relative w-full flex-shrink-0 h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${list.length}`}
            aria-hidden={i !== index}
          >
            <Link 
              href={`/manga/${item.name.replace(" ", "-")}`} 
              className='w-full h-full block'
            >
              <Image
                src={item.img}
                alt={`${item.name} cover image`}
                fill
                priority={i === 0} // Prioritize first image for faster loading
                style={{ objectFit: "cover" }}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-2">
                  {item.name}
                </h2>
                <span className="text-lg md:text-2xl font-semibold">
                  ⭐ {item.rating}/10
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-125 cursor-pointer"
        aria-label="Previous slide"
      >
        &#8249;
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-125 cursor-pointer"
        aria-label="Next slide"
      >
        &#8250;
      </button>

      {/* <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-20"
        aria-label={isPaused ? "Start auto-play" : "Pause auto-play"}
      >
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
      </button> */}

      <div className='flex justify-center items-center p-4 gap-4 absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'>
        {list.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 w-8 cursor-pointer transition-all ${
              index === i ? 'bg-white scale-125' : 'bg-slate-400'
            }`}
            onClick={() => setIndex(i)}
            role="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={index === i}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Card;