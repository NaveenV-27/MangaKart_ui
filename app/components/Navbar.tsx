"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from "@/public/logo.png";
import { CgProfile } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { Menu, X, Star } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
// import {addToCart,decrementQuantity,removeItem, clearCart } from '../redux/slices/cartSlice';

interface MangaResult {
  _id: string;
  title: string;
  manga_id: string;
  authors: string[];
  cover_image: string;
  rating: number;
}

const Navbar = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<MangaResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(true);

  const count = useSelector((state: RootState) => state.cart.totalCount)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/search_manga`, {
          search: searchTerm,
          limit: 5,
        });
        setSearchResults(response.data.results.map((m: any) => ({ 
          _id: m._id, 
          title: m.title, 
          manga_id: m.manga_id, 
          authors: m.authors,
          cover_image: m.cover_image,
          rating: m.rating,
        })));
      } catch (error) {
        console.error("Error searching manga:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    setSearchResults([]);
    setSearchTerm('');
    setIsMenuOpen(false);
  };
  
  const handleResultClick = (title: string) => {
    router.push(`/manga/${title.replaceAll(" ", "-")}`);
    setSearchResults([]);
    setSearchTerm('');
    setIsMenuOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <nav className='h-[10vh] sticky top-0 z-50 bg-gradient-to-r from-[#0B1623] to-[#1b2531] text-gray-300 border-b-1 border-[#807b7b]'>
      
      {/* Desktop Navbar (visible on md and up) */}
      <div className='hidden md:flex flex-center justify-between py-2 px-4 h-full'>
        <Link href="/" className='max-w-fit ml-5'>
          <Image
            src={logo}
            alt="Company Logo"
            width={250}
            className=""
          />
        </Link>
        
        <div className="flex-center relative w-full bg-white text-black ml-32 mr-16 h-10 rounded-3xl justify-between">
          <input 
            type="text" 
            placeholder='Search for manga' 
            className='w-full border-2 border-white focus:outline-none px-3 h-full rounded-l-2xl p-2' 
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleKeyPress}
          />
          {searchFocused && isSearching && (
            <div className="absolute top-10 left-0 mt-1 w-full bg-gray-800 rounded-b-md shadow-lg text-gray-400 p-2 text-lg z-50 flex-center">
              Searching...
            </div>
          )}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-10 left-0 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 rounded-b-md shadow-lg z-50 scrollbar">
              {searchResults.map((manga) => (
                <div
                  key={manga._id}
                  onMouseDown={() => handleResultClick(manga.title)}
                  className="p-3 flex items-center space-x-4 cursor-pointer hover:bg-gray-700 transition-colors text-white"
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={manga.cover_image}
                      alt={manga.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{manga.title}</p>
                    <p className="text-sm text-gray-400">By: {manga.authors.join(', ')}</p>
                    <div className="flex items-center text-yellow-400 text-sm mt-1">
                      <Star size={14} fill="currentColor" strokeWidth={0} />
                      <span className="ml-1 text-gray-300">{manga.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            className='bg-[#707275] w-12 flex-center p-2 h-full rounded-r-2xl size-8 hover:scale-105 hover:bg-[#828488] cursor-pointer' 
            onClick={handleSearchSubmit}
          >
            <IoSearch className='fill-black' />
          </button>
        </div>
        
        <ul className='flex-center gap-4 text-xl mr-4'>
          <Link href="/admin" className='cursor-pointer hover:scale-110 hover:text-white transition-all'>
            Admin
          </Link>
          <Link href="/genres" className='cursor-pointer hover:scale-110 hover:text-white transition-all'>
            Genres
          </Link>
          <li className='cursor-pointer hover:scale-110 hover:text-white transition-all'>Contact</li>
          <li className='cursor-pointer hover:scale-110 hover:text-white transition-all flex-center '>
            <p className='pl-2 pr-1 rounded-l-3xl bg-gray-700 text-sm hidden group-hover:flex'>Naveen</p>
            <CgProfile className='size-6' />
          </li>
          <li className='cursor-pointer hover:scale-110 hover:text-white transition-all flex-center relative'>
            <Link href="/cart">
              <FaShoppingCart className='size-6' />
            </Link>
            <p className='bg-red-500 rounded-4xl flex-center h-4 w-3 text-sm absolute left-4 bottom-3'>
              {isMounted ? count : 0}
            </p>
          </li>
        </ul>
      </div>

      {/* Mobile Navbar (visible on screens smaller than md) */}
      <div className='md:hidden flex flex-wrap items-center justify-between p-4 h-fit sticky top-0 z-50 bg-gradient-to-r from-[#0B1623] to-[#1b2531] text-gray-300'>
        <div className='flex items-center justify-between w-full'>
          <Link href="/" className='mr-6'>
            <Image
              src={logo}
              alt="Company Logo"
              width={200}
              height={80}
              className="h-auto max-w-full"
            />
          </Link>
          <div className='flex items-center space-x-4'>
            <Link href="/cart" className='text-gray-300 hover:text-white transition-colors'>
              <FaShoppingCart size={24} />
            </Link>
            <button
              className='text-gray-300 hover:text-white focus:outline-none'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        
        <div
          id="mobile-menu"
          className={`w-full ${isMenuOpen ? 'block' : 'hidden'} mt-4`}
        >
          <div className="relative w-full bg-white text-black h-10 rounded-3xl mb-4">
            <input 
              type="text" 
              placeholder='Search for manga...' 
              className='w-full focus:outline-none px-4 h-full rounded-3xl p-2 text-black border-2 border-transparent focus:border-gray-500 transition-colors' 
              value={searchTerm}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />
            {isSearching && (
              <div className="absolute top-10 left-0 mt-1 w-full bg-gray-800 rounded-b-md shadow-lg text-gray-400 p-2 text-sm z-50">
                Searching...
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute top-10 left-0 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 rounded-b-md shadow-lg z-50 custom-scrollbar">
                {searchResults.map((manga) => (
                  <div
                    key={manga._id}
                    onClick={() => handleResultClick(manga.title)}
                    className="p-3 flex items-center space-x-4 cursor-pointer hover:bg-gray-700 transition-colors text-white"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={manga.cover_image}
                        alt={manga.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{manga.title}</p>
                      <p className="text-sm text-gray-400">By: {manga.authors.join(', ')}</p>
                      <div className="flex items-center text-yellow-400 text-sm mt-1">
                        <Star size={14} fill="currentColor" strokeWidth={0} />
                        <span className="ml-1 text-gray-300">{manga.rating || 'N/A'}</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
            <button 
              className='absolute right-0 top-0 bg-[#707275] flex-center p-2 h-full rounded-r-3xl w-12 hover:scale-105 hover:bg-[#828488] cursor-pointer' 
              onClick={handleSearchSubmit}
              aria-label="Search"
            >
              <IoSearch className='fill-black' />
            </button>
          </div>
          <ul className='flex flex-col space-y-4 text-center'>
            <Link href="/admin" className='text-lg hover:text-white transition-colors' onClick={() => setIsMenuOpen(false)}>
              Admin
            </Link>
            <Link href="/genres" className='text-lg hover:text-white transition-colors' onClick={() => setIsMenuOpen(false)}>
              Genres
            </Link>
            <li className='text-lg cursor-pointer hover:text-white transition-colors'>Contact</li>
            <li className='flex-center justify-center'>
              <p className='pl-2 pr-1 rounded-l-3xl bg-gray-700 text-sm'>Naveen</p>
              <CgProfile className='size-6' />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;  