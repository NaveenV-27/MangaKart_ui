"use client";

import { useEffect, useState } from "react";
import Carousel from "./components/Carousel";
import MangaList from "./components/MangaList";
import RandomVolumes from "./components/RandomVolumes";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Artificial delay to ensure GSAP animations in children don't flicker
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="min-h-screen  overflow-x-hidden">
      {/* Hero & Popular Section */}
      <div className="flex flex-col items-center w-full max-w-[1440px] mx-auto px-4 md:px-8 gap-12 lg:gap-16 pt-6">
        
        {/* Top Carousel Area */}
        <section className="w-full">
          <Carousel />
        </section>

        {/* Popular/Random Manga Grid */}
        <section className="w-full">
          <MangaList />
        </section>

      </div>

      {/* Featured Volumes Section - Full Width Breakout */}
      <div className="relative mt-10 pb-20">
        {/* Subtle Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent -z-10" />
        
        <div className="w-full">
          <RandomVolumes />
        </div>
      </div>

      {/* Footer Spacer or Newsletter can go here */}
        {/* <footer className="py-12 text-center border-t border-slate-900">
          <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">
            © 2026 MangaKart • Premium Manga Collective
          </p>
        </footer> */}
    </main>
  );
};

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-4 md:px-8 pt-6 animate-pulse">
      <div className="max-w-[1440px] mx-auto w-full space-y-16">
        
        {/* Carousel Skeleton (Landscape) */}
        <div className="w-full h-[300px] md:h-[400px] bg-slate-900 rounded-[2.5rem] border border-slate-800" />

        {/* MangaList Skeleton */}
        <div className="space-y-8">
          <div className="h-8 w-64 bg-slate-900 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
            ))}
          </div>
        </div>

        {/* RandomVolumes Skeleton (Horizontal Scroll Tray) */}
        <div className="space-y-8 pb-20">
           <div className="h-8 w-48 bg-slate-900 rounded-lg" />
           <div className="flex space-x-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[200px] h-[300px] shrink-0 bg-slate-900 rounded-3xl border border-slate-800" />
              ))}
           </div>
        </div>
        
      </div>
    </div>
  );
};