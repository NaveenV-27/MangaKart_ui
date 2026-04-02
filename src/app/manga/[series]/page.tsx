"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Loader2, BookOpen, Layers, ChevronLeft, Info, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCartDb } from '../../redux/slices/cartSlice';
import { AppDispatch } from '../../redux/store/store';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SeriesPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [mangaData, setMangaData] = useState<any | null>(null);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [volumesLoading, setVolumesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const mangaName: string = typeof params.series === "string" ? params.series.replace(/-/g, " ") : "";

  useEffect(() => {
    const fetchMangaDetails = async () => {
      setIsLoading(true);
      try {
        if (mangaName) { 
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_single_manga`, {
            manga: mangaName.replaceAll("%3A", ":"),
          });
          setMangaData(response.data);
        }
      } catch (err) {
        setError("Archives unreachable.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMangaDetails();
  }, [mangaName]);

  useEffect(() => {
    const fetchVolumes = async () => {
      if (!mangaData?.manga_id) return;
      setVolumesLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/get_volumes_by_manga`, {
          manga_id: mangaData.manga_id,
        });
        if (response.data.success === 1) {
          setVolumes(response.data.volumes || []);
        }
      } catch (err) { console.error(err); } finally { setVolumesLoading(false); }
    };
    fetchVolumes();
  }, [mangaData?.manga_id]);

  useGSAP(() => {
    if (!isLoading) {
      gsap.fromTo(".fade-up", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 });
    }
  }, [isLoading]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Retrieving Series Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      
      {/* 1. LANDSCAPE HERO SECTION */}
      <div className="relative w-full max-w-[1400px] mx-auto pt-6 px-4 md:px-8">
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl fade-up">
          {/* Main Landscape Image */}
          <Image 
            src={mangaData.cover_image} 
            alt={mangaData.title} 
            fill 
            className="object-cover transition-transform duration-[10s] hover:scale-105" 
            priority 
          />
          
          {/* Overlays for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />

          {/* Floating Content over Image */}
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Featured Series
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500 font-bold bg-slate-950/50 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                        <Star size={14} fill="currentColor" /> {mangaData.rating}
                    </div>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 drop-shadow-2xl">
                    {mangaData.title}
                </h1>
                <p className="text-slate-300 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                    Curated by <span className="text-indigo-400">{mangaData.authors.join(', ')}</span>
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Dossier */}
        <div className="lg:col-span-8 space-y-12 fade-up">
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Info className="text-indigo-500" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Story Brief</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg italic whitespace-pre-wrap">
              "{mangaData.description}"
            </p>
            
            <div className="flex flex-wrap gap-2 mt-10">
              {mangaData.genres.map((genre: string, i: number) => (
                <Link key={i} href={`/genres/${genre.replace(/ /g, "-")}`} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all uppercase tracking-widest">
                  {genre}
                </Link>
              ))}
            </div>
          </section>

          {/* Gallery - Still works great for Landscape */}
          {mangaData.gallery?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 ml-2">
                <Layers className="text-indigo-500" size={20} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Visual Archives</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mangaData.gallery.map((imgUrl: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-3xl overflow-hidden border border-slate-800 group shadow-xl">
                    <Image src={imgUrl} alt="Gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Volumes (Keep these Portrait for consistency) */}
        <div className="lg:col-span-4 fade-up">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-500" size={20} />
              <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Volumes</h2>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{volumes.length} Units</span>
          </div>

          <div className="space-y-4">
            {volumes.map((volume) => (
              <Link 
                key={volume.volume_id} 
                href={`/volume/${volume.volume_id}`}
                className="group block bg-slate-900 border border-slate-800 rounded-3xl p-3 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex gap-4">
                  {/* Volumes usually have portrait covers even if series have landscape banners */}
                  <div className="relative w-20 h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-slate-800">
                    <Image src={volume.cover_image} alt={volume.volume_title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Release #{volume.volume_number}</p>
                      <h4 className="text-base font-bold text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">
                        {volume.volume_title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-black text-white font-mono">₹{volume.price}</span>
                      <div className="p-2 bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white rounded-xl transition-all">
                        <ShoppingCart size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;