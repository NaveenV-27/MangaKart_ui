"use client";
import React, { useState, useEffect, useCallback } from 'react';
import FiltersSideBar from '../components/FiltersSideBar';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Loader2, BookOpen } from 'lucide-react';

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

  // Initial fetch and filter changes
  useEffect(() => {
    fetchManga(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres, sortBy]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Load more when page changes (but not on filter change)
  useEffect(() => {
    if (page > 1) {
      fetchManga(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSortBy("title_asc");
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-b from-[#1b2531] to-transparent py-8 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center gap-3 mb-2'>
            <BookOpen className='text-blue-400' size={32} />
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Browse Manga</h1>
          </div>
          <p className='text-gray-400 text-lg'>
            Discover from our collection of manga series
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 pb-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar Filters */}
          <aside className='lg:w-72 flex-shrink-0'>
            <FiltersSideBar
              selectedGenres={selectedGenres}
              onGenreChange={setSelectedGenres}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Manga Grid */}
          <main className='flex-1'>
            {/* Results Count */}
            {!isLoading && mangaList.length > 0 && (
              <p className='text-gray-400 mb-4'>
                Showing {mangaList.length} manga{selectedGenres.length > 0 && ` in ${selectedGenres.join(', ')}`}
              </p>
            )}

            {/* Error State */}
            {error && (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <p className='text-red-400 text-lg mb-4'>{error}</p>
                <button
                  onClick={() => fetchManga(true)}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State (Initial) */}
            {isLoading && mangaList.length === 0 && (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='animate-spin text-blue-400 mr-3' size={32} />
                <span className='text-gray-400 text-xl'>Loading manga...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && mangaList.length === 0 && (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <BookOpen className='text-gray-500 mb-4' size={64} />
                <p className='text-gray-400 text-lg mb-2'>No manga found</p>
                <p className='text-gray-500 text-sm mb-4'>
                  Try adjusting your filters to find more results
                </p>
                {selectedGenres.length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className='px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors'
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Manga Grid */}
            {mangaList.length > 0 && (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {mangaList.map((manga, idx) => (
                    <div 
                      key={manga._id || idx} 
                      className="bg-[#232a32] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                    >
                      <Link href={`/manga/${manga.title.replace(/ /g, "-")}`} className="block">
                        {/* Cover Image */}
                        <div className="relative w-full h-56 overflow-hidden">
                          <Image
                            src={manga.cover_image || "/manga_placeholder.png"}
                            alt={manga.title || "Manga Cover"}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                          {/* Gradient Overlay */}
                          <div className='absolute inset-0 bg-gradient-to-t from-[#232a32] via-transparent to-transparent' />
                        </div>

                        {/* Info */}
                        <div className="px-4 py-3">
                          <h3 className='text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors'>
                            {manga.title}
                          </h3>
                          <p className='text-sm text-gray-400 truncate mt-1'>
                            {manga.authors && manga.authors.length > 0 
                              ? `By: ${manga.authors.join(", ")}` 
                              : "Unknown Author"}
                          </p>
                          
                          {/* Rating */}
                          <div className='flex items-center mt-2'>
                            <Star className='text-yellow-400 mr-1' size={16} fill="currentColor" strokeWidth={0} />
                            <span className="text-white font-semibold">
                              {manga.rating ? manga.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Genres */}
                      <div className='flex flex-wrap gap-1.5 px-4 pb-4'>
                        {manga.genres && manga.genres.slice(0, 3).map((genre, i) => (
                          <Link
                            href={`/genres/${encodeURIComponent(genre)}`}
                            key={i}
                            className='bg-gray-700/60 text-gray-300 text-xs px-2 py-1 rounded-full hover:bg-blue-600/60 hover:text-white transition-colors'
                          >
                            {genre}
                          </Link>
                        ))}
                        {manga.genres && manga.genres.length > 3 && (
                          <span className='text-gray-500 text-xs px-2 py-1'>
                            +{manga.genres.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className='flex justify-center mt-8'>
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='animate-spin' size={20} />
                          Loading...
                        </>
                      ) : (
                        'Load More'
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

export default MangaPage;
