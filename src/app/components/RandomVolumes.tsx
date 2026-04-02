"use client";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { ShoppingCart, Loader2, Sparkles } from 'lucide-react';

interface VolumeProps {
  _id: string;
  manga_id: string;
  volume_id: string; 
  volume_title: string;
  description: string; 
  cover_image: string;
  volume_number: number;
  price: number;
  stock: number;
}

const RandomVolumes = () => {
  const [volumeList, setVolumeList] = useState<VolumeProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomVolumes = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/get_random_volumes`);
        setVolumeList(response.data.volumes); 
      } catch (err) {
        setError("Failed to load featured volumes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRandomVolumes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-slate-500 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-sm font-medium animate-pulse">Loading Featured Volumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-rose-400 bg-rose-400/5 border border-rose-900/20 rounded-3xl mx-8">
        {error}
      </div>
    );
  }

  return (
    <div className='py-10 px-4 md:px-0 max-w-full overflow-hidden'>
      <div className="flex items-center gap-3 mb-8 lg:ml-40">
        <Sparkles className="text-indigo-400" size={24} />
        <h2 className='text-2xl md:text-3xl font-black text-white uppercase tracking-tight'>Featured Volumes</h2>
      </div>
      
      {volumeList.length > 0 ? (
        <div className='flex overflow-x-auto space-x-6 pb-8 px-4 lg:px-0 lg:max-w-[80vw] lg:mx-40 no-scrollbar hover:scrollbar-visible transition-all'>
          {/* Custom CSS for the scrollbar can be added to your globals.css or via a style tag below */}
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              height: 6px;
            }
            .no-scrollbar::-webkit-scrollbar-track {
              background: #0f172a;
            }
            .no-scrollbar::-webkit-scrollbar-thumb {
              background: #1e293b;
              border-radius: 10px;
            }
            .no-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #4f46e5;
            }
          `}</style>

          {volumeList.map((volume) => (
            <div
              key={volume.volume_id}
              className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-indigo-500/50 flex flex-col w-[200px] sm:w-[220px] flex-shrink-0 relative"
            >
              {/* Card Main Link */}
              <Link href={`/volume/${volume.volume_id}`} className="flex flex-col flex-grow">
                {/* Volume Cover */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={volume.cover_image}
                    alt={volume.volume_title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="220px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                </div>

                {/* Volume Details */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className='text-base font-bold text-white truncate leading-tight' title={volume.volume_title}>
                      {volume.volume_title || `Volume ${volume.volume_number}`}
                    </h3>
                    <p className='text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest'>
                      VOL. {volume.volume_number}
                    </p>
                    <p className='text-lg font-black text-emerald-400 mt-3'>
                      ₹{volume.price.toFixed(2)}
                    </p>
                  </div>

                  <div className='flex items-center gap-2 mt-3'>
                    <div className={`h-1.5 w-1.5 rounded-full ${volume.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <p className='text-[10px] font-bold text-slate-500 uppercase tracking-tighter'>
                      {volume.stock > 0 ? `${volume.stock} In Stock` : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Action Button */}
              <div className="px-5 pb-5 mt-auto">
                <Link
                  href={`/checkout?type=volume&id=${volume.volume_id}`}
                  className={`flex justify-center items-center w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-300 relative z-10 shadow-lg ${
                    volume.stock > 0 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  aria-disabled={volume.stock === 0}
                  onClick={(e) => { 
                    if (volume.stock === 0) e.preventDefault(); 
                    e.stopPropagation(); 
                  }}
                >
                  <ShoppingCart size={14} className='mr-2' />
                  {volume.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed mx-8 lg:mx-40">
           <p className="text-slate-500 font-medium italic">
            No featured volumes found in the archives.
          </p>
        </div>
      )}
    </div>
  );
};

export default RandomVolumes;