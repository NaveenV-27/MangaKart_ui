"use client"
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { Star } from 'lucide-react';

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

  useEffect(() => {
    const fetchMangaList = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/manga_profile`, {
          limit: 10,
        });
        setMangaList(response.data);
      } catch (err) {
        console.error("Error fetching manga list:", err);
        setError("Failed to load manga. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMangaList();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center h-48 text-gray-400 text-xl">
        Loading New Releases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center h-48 text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className='p-6 md:p-10'>
      <h2 className='text-3xl font-bold mb-6 text-white'>Some Popular Series'</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 gap-y-8'>
        {mangaList.length > 0 ? (
          mangaList.map((manga, idx) => (
            <div key={manga._id || idx} className="bg-[#232a32] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
              <Link
                href={`/manga/${manga.title.replace(/ /g, "-")}`}
                className="block"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={manga.cover_image || "/manga_placeholder.png"}
                    alt={manga.title || "Manga Cover"}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className='text-lg font-bold text-white truncate'>
                    {manga.title}
                  </h3>
                  <p className='text-sm text-gray-400 mt-1 truncate'>
                    By: {manga.authors && manga.authors.join(", ")}
                  </p>
                  <div className='flex items-center mt-2'>
                    <span className="text-yellow-400 mr-1">
                      <Star size={16} fill="currentColor" strokeWidth={0}/>
                    </span>
                    <span className="text-white font-semibold">{manga.rating || "N/A"}</span>
                  </div>
                </div>
              </Link>
              <div className='flex flex-wrap mt-3 gap-2 p-4 pt-0'>
                {manga.genres && manga.genres.map((genre, i) => (
                  <Link
                    href={`/genres/${genre.replace(" ", "-")}`}
                    key={i}
                    className='bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full hover:bg-gray-500 transition-colors'
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-lg">
            No new releases found.
          </p>
        )}
      </div>
    </div>
  );
};

export default MangaList;