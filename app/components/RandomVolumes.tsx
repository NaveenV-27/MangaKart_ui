"use client";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react'; // Using ShoppingCart icon for Buy/View

interface VolumeProps {
  _id: string;
  manga_id: string;
  volume_id: string; // Added volume_id from response
  volume_title: string;
  description: string; // Added description for display
  cover_image: string;
  volume_number: number;
  price: number;
  stock: number;
  // Note: 'authors' is not in the response, so I removed it from the interface/display
}

const RandomVolumes = () => {
  const [volumeList, setVolumeList] = useState<VolumeProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomVolumes = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_random_volumes`, {
          limit: 3, // Requesting 3 volumes as specified
        });
        // Set the state directly with the array from the API response
        setVolumeList(response.data.volumes); 
      } catch (err) {
        console.error("Error fetching random volumes:", err);
        setError("Failed to load featured volumes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRandomVolumes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center h-48 text-gray-400 text-xl">
        Loading Featured Volumes...
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
      <h2 className='text-3xl font-bold mb-6 text-white'>Featured Volumes</h2>
      
      {volumeList.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {volumeList.map((volume) => (
            <div
              key={volume.volume_id}
              className="bg-[#232a32] rounded-lg overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.03] flex flex-col"
            >
              {/* Volume Cover */}
              <Link href={`/volume/${volume.volume_id}`} className="relative w-full aspect-[3/4] block flex-shrink-0">
                <Image
                  src={volume.cover_image}
                  alt={`${volume.volume_title} Volume ${volume.volume_number}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="rounded-t-lg"
                />
              </Link>
              
              {/* Volume Details */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className='text-xl font-bold text-white truncate' title={volume.volume_title}>
                    {volume.volume_title || `Volume ${volume.volume_number}`}
                  </h3>
                  <p className='text-sm text-gray-400 mt-1'>
                    Vol. {volume.volume_number}
                  </p>
                  <p className='text-md font-semibold text-green-400 mt-2'>
                    ${volume.price.toFixed(2)}
                  </p>
                </div>

                <p className='text-xs text-gray-500 mt-2'>
                    {volume.stock > 0 ? `${volume.stock} in stock` : 'Out of Stock'}
                </p>

                {/* Action Button */}
                <div className="mt-4">
                    <Link
                        href={`/checkout/${volume.volume_id}`}
                        className='flex-center w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-500'
                        aria-disabled={volume.stock === 0}
                        onClick={(e) => { if (volume.stock === 0) e.preventDefault(); }}
                    >
                        <ShoppingCart size={18} className='mr-2' />
                        {volume.stock > 0 ? 'Buy Now' : 'Notify Me'}
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg">
          No featured volumes available right now.
        </p>
      )}
    </div>
  );
};

export default RandomVolumes;