"use client";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { LucideArrowUpRight, Star, Loader2, Sparkles } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface MangaProps {
  _id: string;
  manga_id: string;
  title: string;
  authors: string[];
  genres: string[];
  cover_image: string;
  rating: number;
}

const MangaList = () => {
  const [mangaList, setMangaList] = useState<MangaProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useGSAP(() => {
    if (mangaList.length > 0) {
      gsap.fromTo(".manga-card", {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  }, [mangaList]);

  useEffect(() => {
    const fetchMangaList = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_random_manga`, {
          limit: 6,
        }, { withCredentials: true });
        setMangaList(response.data);
      } catch (err) {
        setError("Failed to load popular series.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMangaList();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-sm font-medium animate-pulse">Curating Popular Series...</p>
      </div>
    );
  }

  if (error) return <div className="text-center p-10 text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20">{error}</div>;

  return (
    <div className='py-12 px-4 md:px-8 bg-slate-900/30 rounded-3xl border border-slate-800/50 my-8'>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="text-indigo-400" size={24} />
          </div>
          <h2 className='text-2xl md:text-3xl font-black text-white uppercase tracking-tight'>Popular Series</h2>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
        {mangaList.map((manga, idx) => (
          <div 
            key={manga._id || idx} 
            className="manga-card group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
          >
            <Link href={`/manga/${manga.title.replace(/ /g, "-")}`} className="block relative">
              {/* Card Image Wrapper */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={manga.cover_image || "/manga_placeholder.png"}
                  alt={manga.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-slate-950/60 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[11px] font-bold text-white">{manga.rating || "N/A"}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className='text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors duration-300'>
                  {manga.title}
                </h3>
                <p className='text-xs text-slate-500 font-medium mt-1 truncate'>
                  {manga.authors?.join(", ")}
                </p>

                {/* Genre Tags (Limited to 3 for clean UI) */}
                <div className='flex flex-wrap gap-2 mt-4'>
                  {manga.genres?.slice(0, 3).map((genre, i) => (
                    <span 
                      key={i}
                      className='text-[10px] font-bold px-2.5 py-1 bg-slate-800 text-slate-400 rounded-md uppercase border border-slate-700/50 transition-colors group-hover:border-indigo-500/30'
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer / Show More */}
      <div className='relative flex items-center group'>
        <div className='flex-grow h-px bg-slate-800 group-hover:bg-indigo-500/30 transition-colors'></div>
        <Link 
          href="/manga" 
          className='mx-4 flex items-center gap-2 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold text-slate-400 hover:text-white hover:border-indigo-500 transition-all shadow-lg'
        >
          View Full Library <LucideArrowUpRight size={16} />
        </Link>
        <div className='flex-grow h-px bg-slate-800 group-hover:bg-indigo-500/30 transition-colors'></div>
      </div>
    </div>
  );
};

export default MangaList;