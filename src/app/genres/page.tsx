"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Layers, Sparkles, ChevronRight } from "lucide-react";

const genreColors: { [key: string]: string } = {
  Action: "from-red-600/20",
  Adventure: "from-orange-600/20",
  Comedy: "from-yellow-600/20",
  Drama: "from-blue-600/20",
  Fantasy: "from-purple-600/20",
  Horror: "from-slate-800/20",
  Mystery: "from-indigo-600/20",
  Romance: "from-rose-600/20",
  "Sci-Fi": "from-cyan-600/20",
  "Slice of Life": "from-emerald-600/20",
  Sports: "from-blue-500/20",
  Supernatural: "from-violet-600/20",
};

const GenresPage = () => {
  const genres = Object.keys(genreColors);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getRandomImages = async (): Promise<string[]> => {
    try {
      const response = await axios.get("https://api.jikan.moe/v4/top/anime", {
        params: { limit: 24 },
        timeout: 5000,
      });
      return response?.data?.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((anime: any) => anime?.images?.jpg?.large_image_url)
        .filter(Boolean);
    } catch (error) {
      console.error("Failed to fetch anime images:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const cached = localStorage.getItem("genreImages");
        if (cached) {
          setImages(JSON.parse(cached));
        } else {
          const imgs = await getRandomImages();
          if (imgs.length > 0) {
            setImages(imgs);
            localStorage.setItem("genreImages", JSON.stringify(imgs));
          }
        }
      } catch (err) {
        console.error("Image load failed:", err);
      } finally {
        // Small delay for smooth entry
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    loadImages();
  }, []);

  const getImageForGenre = (index: number) => {
    if (!images || images.length === 0) return null;
    return images[index % images.length];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 border-b border-slate-800 py-16 px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl">
              <Layers className="text-indigo-500" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                Browse Genres
              </h1>
              <p className="text-slate-400 mt-2 text-lg font-medium">
                Target your interests across the multi-verse library.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Genre Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-900 rounded-[2rem] border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {genres.map((genre, index) => {
              const bgGradient = genreColors[genre] || "from-indigo-600/20";
              const genreImage = getImageForGenre(index);

              return (
                <Link
                  key={genre}
                  href={`/genres/${encodeURIComponent(genre)}`}
                  className="group relative h-40 rounded-[2rem] overflow-hidden border border-slate-800 transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/50 shadow-xl"
                >
                  {/* Background Image with Ken Burns Effect */}
                  {genreImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${genreImage})` }}
                    />
                  )}

                  {/* Thematic Overlays */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} to-slate-950/90 backdrop-blur-[2px] transition-colors group-hover:backdrop-blur-none`} />
                  <div className="absolute inset-0 bg-slate-950/40" />

                  {/* Content */}
                  <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <Sparkles className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                       <ChevronRight className="text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1" size={20} />
                    </div>
                    
                    <div>
                      <span className="block text-xl font-black text-white uppercase italic tracking-tight group-hover:text-indigo-300 transition-colors">
                        {genre}
                      </span>
                      <div className="w-8 h-1 bg-indigo-600 mt-2 rounded-full transition-all group-hover:w-16" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenresPage;