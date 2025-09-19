"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from "@/public/logo.png"
import { CgProfile } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (!isMounted || !searchTerm.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className='flex-center sticky top-0 z-50 justify-between py-2 px-4 h-fit bg-gradient-to-r from-[#0B1623] to-[#1b2531] text-gray-300'>
        <Link href="/" className='max-w-fit ml-5'>
        {/* MANGA<span className='text-blue-500'>kart</span> */}
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
          onKeyPress={handleKeyPress}
        />
        <button 
          className='bg-[#707275] w-12 flex-center p-2 h-full rounded-r-2xl size-8 hover:scale-105 hover:bg-[#828488] cursor-pointer' 
          onClick={handleSearch}
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
          <p className='pl-2 pr-1 rounded-l-3xl bg-gray-700 text-sm'>Naveen</p>
          <CgProfile className='size-6' />
        </li>
        <li className='cursor-pointer hover:scale-110 hover:text-white transition-all'>
          <Link href="/cart">
            <FaShoppingCart className='size-6' />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;