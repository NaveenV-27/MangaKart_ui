"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SlideItem {
  img: string;
  name: string;
  rating: string;
  tag: string;
}

const list: SlideItem[] = [
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758189872/uploads/sxevyu3z8w7rb3vfsudp.avif", name: "One Piece", rating: "9.7", tag: "Adventure" },
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758190467/uploads/wsnmtkqbbdnmmlkcgqc0.avif", name: "Dragon Ball", rating: "9.3", tag: "Classic" },
  { img: "https://res.cloudinary.com/mangakart/image/upload/v1758190322/uploads/uiijxsxxda7n15uhdngb.avif", name: "Naruto", rating: "8.9", tag: "Ninja Saga" },
];

const AUTO_SLIDE_INTERVAL = 5000;

const HeroCarousel = () => {
  const [index, setIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useGSAP(() => {
    gsap.fromTo("#hero-animate", {
      opacity: 0,
      scale: 0.95,
    }, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    });
  }, []);

  const nextSlide = useCallback((): void => {
    setIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback((): void => {
    setIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [index, isPaused, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div 
      id='hero-animate'
      className="relative w-full max-w-[1400px] mt-6 mx-auto overflow-hidden rounded-3xl group border border-slate-800 shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Trending Badge */}
      <div className="absolute top-6 left-8 z-30 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/40">
        <TrendingUp size={14} />
        Trending Now
      </div>

      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {list.map((item, i) => (
          <div 
            key={i} 
            className="relative w-full flex-shrink-0 h-[400px] md:h-[600px] overflow-hidden"
          >
            <Link 
              href={`/manga/${item.name.replace(" ", "-")}`} 
              className='w-full h-full block'
            >
              <Image
                src={item.img}
                alt={item.name}
                fill
                priority={i === 0}
                className="object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              
              {/* Cinematic Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent"></div>

              {/* Content */}
              <div className="absolute bottom-12 left-8 md:left-12 z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-[10px] font-bold text-white uppercase tracking-widest">
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <span className="text-sm">⭐ {item.rating}</span>
                  </div>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
                  {item.name}
                </h2>
                
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 text-sm uppercase tracking-widest cursor-pointer">
                  View Series
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-slate-900/50 backdrop-blur-xl text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 z-30 cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-slate-900/50 backdrop-blur-xl text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 z-30 cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className='flex justify-center items-center gap-3 absolute bottom-6 right-8 z-30'>
        {list.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              index === i ? 'w-12 bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'w-4 bg-slate-600 hover:bg-slate-400'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;