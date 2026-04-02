"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, Loader2, BookCopy, Sparkles } from 'lucide-react';

interface MangaProps {
  _id: string;
  manga_id: string;
  title: string;
  authors: string[];
  genres: string[];
  cover_image: string;
  rating: number;
}

const GenrePage = () => {
  const [mangaList, setMangaList] = useState<MangaProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const genreName: string = typeof params.genre === "string" ? params.genre.replace("-", " ") : "";

  useEffect(() => {
    const fetchGenreManga = async () => {
      if (!genreName) return;
      setIsLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/find_manga_by_genre`, {
          genre: genreName,
        });
        setMangaList(response.data);
      } catch (error) {
        console.error("Error fetching manga list:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 400); // Smooth transition
      }
    };

    fetchGenreManga();
  }, [genreName]);

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 pb-20'>
      {/* Cinematic Header */}
      <div className='bg-slate-900 border-b border-slate-800 py-12 px-6 mb-10'>
        <div className='max-w-7xl mx-auto'>
          <button 
            onClick={() => router.back()}
            className='flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 group text-sm font-bold uppercase tracking-widest'
          >
            <ChevronLeft size={18} className='group-hover:-translate-x-1 transition-transform' />
            All Genres
          </button>
          
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <Sparkles className='text-indigo-500' size={20} />
                <span className='text-xs font-black uppercase tracking-[0.3em] text-indigo-400'>Category Archives</span>
              </div>
              <h1 className='text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter'>
                {genreName}
              </h1>
            </div>
            {!isLoading && (
              <p className='text-slate-500 font-bold uppercase text-xs tracking-widest bg-slate-950 px-4 py-2 rounded-full border border-slate-800'>
                {mangaList.length} Volumes Found
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6'>
        {isLoading ? (
          /* Loading Skeleton */
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='bg-slate-900 h-[450px] rounded-[2rem] border border-slate-800' />
            ))}
          </div>
        ) : mangaList.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {mangaList.map((manga) => (
              <Link 
                key={manga._id} 
                href={`/manga/${manga.title.replace(/\s+/g, '-')}`}
                className='group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5'
              >
                <div className='relative aspect-[3/4] overflow-hidden'>
                  <Image 
                    src={manga.cover_image} 
                    alt={manga.title} 
                    fill 
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80' />
                  
                  {/* Rating Badge */}
                  <div className='absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-700'>
                    <Star size={12} className='text-yellow-500 fill-yellow-500' />
                    <span className='text-white text-[10px] font-black'>{manga.rating || 'N/A'}</span>
                  </div>
                </div>

                <div className='p-6'>
                  <h3 className='text-white font-black uppercase tracking-tight truncate leading-tight group-hover:text-indigo-400 transition-colors text-lg'>
                    {manga.title}
                  </h3>
                  <p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate'>
                    {manga.authors?.join(', ') || 'Unknown Author'}
                  </p>
                  
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {manga.genres.slice(0, 2).map((g) => (
                      <span key={g} className='text-[9px] font-black px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700/50 uppercase'>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className='flex flex-col items-center justify-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800'>
            <BookCopy className='text-slate-700 mb-6' size={60} />
            <h3 className='text-xl font-bold text-white'>No Archives Found</h3>
            <p className='text-slate-500 text-sm mt-1'>We couldn't find any manga under the {genreName} category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;