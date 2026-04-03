"use client";
import React, { useState, useEffect, useCallback } from 'react';
import FiltersSideBar from '../components/FiltersSideBar';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Loader2, BookOpen, Layers, FilterX } from 'lucide-react';

interface MangaProps {
  _id: string;
  manga_id: string;
  title: string;
  authors: string[];
  genres: string[];
  cover_image: string;
  rating: number;
}

const MangaPage = () => {
  const [mangaList, setMangaList] = useState<MangaProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("title_asc");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  const fetchManga = useCallback(async (resetList = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentPage = resetList ? 1 : page;
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_all_manga`,
        {
          page: currentPage,
          limit,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          sort: sortBy,
        },
        { withCredentials: true }
      );
      
      const data = response.data.results || response.data.data || response.data || [];
      
      if (resetList) {
        setMangaList(data);
        setPage(1);
      } else {
        setMangaList(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
    } catch (err) {
      console.error("Error fetching manga:", err);
      setError("Failed to load manga. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedGenres, sortBy]);

  useEffect(() => {
    fetchManga(true);
  }, [selectedGenres, sortBy, fetchManga]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchManga(false);
    }
  }, [page, fetchManga]);

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSortBy("title_asc");
  };

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200'>
      {/* Header Section */}
      <div className='bg-slate-900 border-b border-slate-800 py-12 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='p-3 bg-indigo-600/10 rounded-2xl'>
              <BookOpen className='text-indigo-500' size={32} />
            </div>
            <div>
              <h1 className='text-3xl md:text-5xl font-extrabold text-white tracking-tight'>Explore Manga</h1>
              <p className='text-slate-400 mt-1 text-lg'>Discover your next favorite series from our curated library.</p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-10'>
        <div className='flex flex-col lg:flex-row gap-10'>
          
          {/* Filters Sidebar */}
          <aside className='lg:w-72 shrink-0'>
            <div className='sticky top-24'>
              <FiltersSideBar
                selectedGenres={selectedGenres}
                onGenreChange={setSelectedGenres}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Manga Grid */}
          <main className='flex-1'>
            {/* Header / Stats */}
            <div className='flex items-center justify-between mb-8'>
              {!isLoading && mangaList.length > 0 && (
                <div className='flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-slate-800'>
                  <Layers size={14} className='text-indigo-400' />
                  Showing {mangaList.length} Results
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className='bg-red-950/20 border border-red-900/50 p-8 rounded-3xl text-center'>
                <p className='text-red-400 font-medium mb-4'>{error}</p>
                <button
                  onClick={() => fetchManga(true)}
                  className='px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition'
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Initial Loading Skeleton */}
            {isLoading && mangaList.length === 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='bg-slate-900 h-80 rounded-3xl border border-slate-800' />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && mangaList.length === 0 && (
              <div className='flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed'>
                <FilterX className='text-slate-700 mb-4' size={64} />
                <h3 className='text-xl font-bold text-white'>No manga matched your filters</h3>
                <p className='text-slate-500 mt-1 max-w-xs text-center'>Try removing some genres or changing the sort order.</p>
                <button
                  onClick={handleClearFilters}
                  className='mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition'
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Manga Grid Container */}
            {mangaList.length > 0 && (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {mangaList.map((manga, idx) => (
                    <div 
                      key={manga._id || idx} 
                      className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                      <Link href={`/manga/${manga.title.replace(/ /g, "-")}`} className="block relative">
                        {/* Image Layer */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Image
                            src={manga.cover_image || "/manga_placeholder.png"}
                            alt={manga.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80' />
                          
                          {/* Floating Rating */}
                          <div className='absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5'>
                            <Star className='text-yellow-500 fill-yellow-500' size={14} />
                            <span className="text-white text-xs font-bold">
                              {manga.rating ? manga.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="p-5">
                          <h3 className='text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors'>
                            {manga.title}
                          </h3>
                          <p className='text-xs text-slate-500 truncate mt-1 uppercase tracking-wider font-semibold'>
                            {manga.authors?.[0] || "Unknown Author"}
                          </p>
                          
                          {/* Tags */}
                          <div className='flex flex-wrap gap-2 mt-4'>
                            {manga.genres?.slice(0, 2).map((genre, i) => (
                              <span 
                                key={i}
                                className='text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded-md uppercase border border-slate-700/50'
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

                {/* Load More Section */}
                {hasMore && (
                  <div className='flex justify-center mt-12'>
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className='group relative px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-3'
                    >
                      {isLoading ? (
                        <Loader2 className='animate-spin' size={20} />
                      ) : (
                        <>
                          View More
                          <ChevronRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Simple Arrow helper for button
const ChevronRight = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);

export default MangaPage;