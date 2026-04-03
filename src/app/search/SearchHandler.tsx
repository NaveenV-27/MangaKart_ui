"use client"
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Star, Loader2, BookX, RotateCcw } from 'lucide-react'

interface MangaResult {
  _id: string;
  title: string;
  authors: string[];
  cover_image: string;
  rating: number;
  genres: string[];
}

const SearchHandler = () => {
    const searchParams = useSearchParams()
    const query = searchParams.get('query')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const [rawResults, setRawResults] = useState<MangaResult[]>([])
    const [loading, setLoading] = useState(true)
    // const [error, setError] = useState<string | null>(null)

    // --- Filter States ---
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [minRating, setMinRating] = useState<number>(0)

    // Extract all unique genres from results for the sidebar
    const availableGenres = useMemo(() => {
        const genres = new Set<string>()
        rawResults.forEach(m => m.genres?.forEach(g => genres.add(g)))
        return Array.from(genres).sort()
    }, [rawResults])

    // --- Client-Side Filter Logic ---
    const filteredResults = useMemo(() => {
        return rawResults.filter(manga => {
            const matchesGenre = selectedGenres.length === 0 || 
                selectedGenres.every(g => manga.genres?.includes(g));
            const matchesRating = (manga.rating || 0) >= minRating;
            
            return matchesGenre && matchesRating;
        })
    }, [rawResults, selectedGenres, minRating])

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return
            setLoading(true)
            // setError(null)
            try {
                const response = await axios.post(`${baseUrl}/api/manga/search_manga`, {
                    search: query,
                    limit: 50, // Fetch a larger set so client-side filtering is meaningful
                })
                console.log("response:", response.data)
                setRawResults(response.data.results || [])
            } catch (err) {
                console.error(err);
                // setError("Failed to retrieve search data.")
            } finally {
                setLoading(false)
            }
        }
        fetchResults()
    }, [query, baseUrl])

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev => 
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        )
    }

    const resetFilters = () => {
        setSelectedGenres([])
        setMinRating(0)
    }

    return (
        <div className='min-h-screen bg-slate-950 flex flex-col lg:flex-row'>
            
            {/* LEFT SIDEBAR: Working Client-Side Filters */}
            <aside className='w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-6 shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar'>
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center gap-2 text-indigo-400'>
                        <Filter size={18} />
                        <h2 className='text-xs font-black uppercase tracking-[0.2em]'>Filters</h2>
                    </div>
                    {(selectedGenres.length > 0 || minRating > 0) && (
                        <button onClick={resetFilters} className='text-slate-500 hover:text-white transition-colors'>
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>

                {/* Rating Filter */}
                <div className='mb-10'>
                    <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4'>Minimum Rating</h3>
                    <div className='flex flex-col gap-2'>
                        {[4, 3, 2].map((star) => (
                            <button 
                                key={star}
                                onClick={() => setMinRating(minRating === star ? 0 : star)}
                                className={`flex items-center justify-between px-4 py-2 rounded-xl border text-sm transition-all ${minRating === star ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                <div className='flex items-center gap-1'>
                                    {star}+ <Star size={12} fill={minRating === star ? "white" : "currentColor"} />
                                </div>
                                <span className='text-[10px] opacity-50'>
                                    ({rawResults.filter(m => (m.rating || 0) >= star).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Genre Filter */}
                <div>
                    <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4'>Genres</h3>
                    <div className='flex flex-wrap gap-2'>
                        {availableGenres.length > 0 ? availableGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => toggleGenre(genre)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                    selectedGenres.includes(genre)
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                }`}
                            >
                                {genre}
                            </button>
                        )) : (
                            <p className='text-xs text-slate-600 italic'>No genres found in results</p>
                        )}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className='flex-1 p-6 md:p-10'>
                <header className='mb-10'>
                    <div className='flex items-center gap-3 text-slate-500 mb-2'>
                        <Search size={18} />
                        <span className='text-xs font-black uppercase tracking-widest'>Search Results</span>
                    </div>
                    <h1 className='text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter'>
                        {query ? `"${query}"` : "Archives"}
                    </h1>
                    {!loading && (
                        <p className='text-indigo-400 text-sm mt-2 font-bold uppercase tracking-tight'>
                            Showing {filteredResults.length} of {rawResults.length} discovered volumes
                        </p>
                    )}
                </header>

                {loading ? (
                    <div className='flex flex-col items-center justify-center py-40 text-slate-500'>
                        <Loader2 className='animate-spin text-indigo-500 mb-4' size={40} />
                        <p className='font-mono text-[10px] uppercase tracking-[0.3em]'>Accessing Database...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800'>
                        <BookX className='text-slate-700 mb-6' size={60} />
                        <h3 className='text-xl font-bold text-white'>No matches found</h3>
                        <p className='text-slate-500 text-sm mt-1'>Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500'>
                        {filteredResults.map((manga) => (
                            <Link 
                                key={manga._id} 
                                href={`/manga/${manga.title.replace(/ /g, "-")}`}
                                className='group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5'
                            >
                                <div className='relative aspect-[3/4] overflow-hidden'>
                                    <Image src={manga.cover_image} alt={manga.title} fill className='object-cover transition-transform duration-700 group-hover:scale-110' sizes="300px" />
                                    <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80' />
                                    <div className='absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-slate-700'>
                                        <Star size={12} className='text-yellow-500 fill-yellow-500' />
                                        <span className='text-white text-[10px] font-black'>{manga.rating || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className='p-5'>
                                    <h3 className='text-white font-black uppercase tracking-tight truncate leading-tight group-hover:text-indigo-400 transition-colors'>{manga.title}</h3>
                                    <p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate'>{manga.authors?.join(', ')}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default SearchHandler;