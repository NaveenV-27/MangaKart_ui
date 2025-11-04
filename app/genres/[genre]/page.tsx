"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const GenrePage = () => {
  const [mangaList, setMangaList] = useState([]);
  const params = useParams();
  const genre : string = typeof (params.genre) === "string"? params.genre : "";

  useEffect(() => {
    const fetchGenreManga = async () => {
      const genreReq = genre.replace("-", " ");
      console.log("Fetching Genre... ", genreReq)
      try {
        if (genre) { // Check if genre is available
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/find_manga_by_genre`, {
            genre : genreReq,
          });
          console.log("Response from API:", response.data)
          setMangaList(response.data);
        }
      } catch (error) {
        console.error("Error fetching manga list:", error);
      }
    };

    fetchGenreManga();
  }, [genre]);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-4xl font-bold text-center my-8 capitalize'>
        Genre: {genre ? genre.replace("-", " ") : ''}
      </h1>
      
      {mangaList.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {mangaList.map((manga: any) => (
            <div key={manga._id} className='bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300'>
              <img 
                src={manga.cover_image} 
                alt={manga.title} 
                className='w-full h-80 object-cover'
              />
              <div className='p-4'>
                <h2 className='text-xl font-semibold text-white truncate'>
                  {manga.title}
                </h2>
                <p className='text-gray-400 mt-1 text-sm'>
                  By: {manga.authors.join(', ')}
                </p>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {manga.genres.map((g: string) => (
                    <span 
                      key={g} 
                      className='bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full'
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className='flex items-center mt-3 text-sm text-yellow-400'>
                  <span className='mr-1'>⭐</span>
                  <span className='font-bold'>{manga.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-lg text-gray-400'>
          No manga found for this genre.
        </p>
      )}
    </div>
  );
};

export default GenrePage;