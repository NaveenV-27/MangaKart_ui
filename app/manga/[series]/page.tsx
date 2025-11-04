"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface MangaData {
  _id: string;
  manga_id: string;
  title: string;
  description: string;
  authors: string[];
  genres: string[];
  cover_image: string;
  gallery: string[];
  rating: number;
}

interface VolumeData {
  // _id: string;
  // manga_id: string;
  volume_id: string; 
  volume_title: string;
  // description: string; 
  cover_image: string;
  volume_number: number;
  price: number;
  // stock: number;
}

const page = () => {
  const params = useParams();
  const [mangaData, setMangaData] = useState<MangaData | null>(null);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mangaName: string = typeof params.series === "string" ? params.series.replace(/-/g, " ") : "";

  useEffect(() => {
    const fetchMangaDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (mangaName) { 
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_single_manga`, {
            manga: mangaName.replaceAll("%3A", ":"),
          });
          setMangaData(response.data);
        }
      } catch (err) {
        console.error("Error fetching manga details:", err);
        setError("Failed to load manga details. Please check the URL.");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchMangaVolumes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (mangaName) { 
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/get_volumes_by_manga`, {
            manga_id: mangaData?.manga_id,
          });
          if(response.data.success == 1) {
            setVolumes(response.data)
          }
        }
      } catch (err) {
        console.error("Error fetching manga details:", err);
        setError("Failed to load manga details. Please check the URL.");
      } finally {
        setIsLoading(false);
      }
      
    }

    fetchMangaDetails();
  }, [mangaName]);

  if (isLoading) {
    return (
      <div className="flex-center h-[79vh] text-gray-400 text-xl">
        Loading manga details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center h-[79vh] text-red-400 text-xl">
        {error}
      </div>
    );
  }

  if (!mangaData) {
    return (
      <div className="flex-center h-[79vh] text-gray-400 text-xl">
        Manga not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 text-gray-300">
      <div className="bg-[#1b2531] rounded-lg shadow-2xl p-6 md:p-8">
        {/* Top Section: Image and Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Image */}
          <div className="flex-shrink-0 w-full md:w-1/3">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={mangaData.cover_image}
                alt={`${mangaData.title} Cover`}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg bg-gray-900"
              />
            </div>
          </div>
          {/* Info Section */}
          <div className="flex-1 mt-6 md:mt-0">
            <h1 className="text-4xl font-bold text-white mb-2">{mangaData.title}</h1>
            <div className="flex items-center text-yellow-400 mb-4">
              <Star size={24} fill="currentColor" strokeWidth={0} />
              <span className="ml-2 font-semibold text-xl">{mangaData.rating}</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              <span className="font-semibold text-white">Authors:</span> {mangaData.authors.join(', ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {mangaData.genres.map((genre, index) => (
                <Link
                  key={index}
                  href={`/genres/${genre.replaceAll(" ", "-")}`}
                  className="bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded-full hover:bg-gray-500 transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section (Full Width) */}
        <div className="w-full">
          <h3 className="text-2xl font-bold text-white mb-4">Description</h3>
          <p className="text-gray-400 leading-relaxed text-base">
            {mangaData.description}
          </p>
        </div>

        {/* Gallery Section */}
        {mangaData.gallery && mangaData.gallery.length > 0 && (
          <div className="w-full mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mangaData.gallery.map((imgUrl, index) => (
                <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className='flex-center gap-4'>
          {volumes && volumes.length > 0 ? "" : ""}
      </div>
    </div>
  );
};

export default page;