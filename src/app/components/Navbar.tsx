"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from "@/public/logo.png";
import { CgProfile } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { Menu, X, Star, Loader2, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import Cookies from 'js-cookie';

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
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const cartState = useSelector((state: RootState) => state.cart);
  const count = cartState?.totalCount || 0;
  const role = Cookies.get("ROLE") || "";
  const isAdmin = role === "ADMIN";
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const nameFromCookie = Cookies.get("Name");
    if (nameFromCookie) setUsername(nameFromCookie);

    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
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
        setSearchResults(response.data.results);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    setSearchFocused(false);
    setIsMenuOpen(false);
  };

  const handleResultClick = (title: string) => {
    router.push(`/manga/${title.replaceAll(" ", "-")}`);
    setSearchTerm("");
    setSearchFocused(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className='sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-300'>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4'>
        
        {/* Logo */}
        <Link href="/" className='shrink-0 transition-transform hover:scale-105'>
          <Image src={logo} alt="MangaKart" width={140} height={40} className="w-auto h-8 md:h-10" priority />
        </Link>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-md group">
          <div className={`flex items-center w-full bg-slate-900 border transition-all duration-200 rounded-xl overflow-hidden ${searchFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-600'}`}>
            <input
              type="text"
              placeholder='Search manga...'
              className='w-full bg-transparent px-4 py-2 text-sm text-white focus:outline-none'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <button onClick={handleSearchSubmit} className="px-3 text-slate-400 hover:text-white transition-colors">
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <IoSearch size={20} />}
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && (searchTerm.length > 0) && (
            <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {searchResults.length > 0 ? (
                searchResults.map((manga) => (
                  <div
                    key={manga._id}
                    onMouseDown={() => handleResultClick(manga.title)}
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden">
                      <Image src={manga.cover_image} alt={manga.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{manga.title}</p>
                      <p className="text-xs text-slate-500 truncate">{manga.authors?.join(', ')}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] text-slate-400">{manga.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : !isSearching && (
                <div className="p-4 text-center text-sm text-slate-500">No manga found</div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-medium">
            {isAdmin && (
              <Link href="/admin" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                <LayoutDashboard size={16} /> Admin
              </Link>
            )}
            <Link href="/genres" className="hover:text-indigo-400 transition-colors">Genres</Link>
            <Link href="/orders" className="hover:text-indigo-400 transition-colors">Orders</Link>
          </div>

          <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
            <Link href="/cart" className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <FaShoppingCart size={22} />
              {isMounted && count > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-950">
                  {count}
                </span>
              )}
            </Link>

            <Link href={isAdmin ? "/admin/profile" : "/profile"} className="flex items-center gap-2 p-1 pr-3 bg-slate-900 border border-slate-800 rounded-full hover:border-slate-600 transition-all">
              <div className="bg-slate-800 p-1.5 rounded-full">
                <CgProfile size={20} className="text-indigo-400" />
              </div>
              {isMounted && username && <span className="text-xs font-bold text-slate-200">{username}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile Toggle & Cart */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart" className="p-2 relative">
            <FaShoppingCart size={22} />
            {isMounted && count > 0 && <span className="absolute top-1 right-1 bg-indigo-600 w-2 h-2 rounded-full" />}
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden bg-slate-900 border-b border-slate-800 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4">
          <div className="relative">
             <input
              type="text"
              placeholder='Search manga...'
              className='w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoSearch className="absolute right-4 top-3.5 text-slate-500" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Link href="/genres" onClick={() => setIsMenuOpen(false)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold">Genres</Link>
            <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold">Orders</Link>
            {isAdmin && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl text-sm font-bold border border-indigo-500/20 col-span-2">Admin Dashboard</Link>}
            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold col-span-2 flex items-center justify-center gap-2">
              <CgProfile size={18} /> Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;