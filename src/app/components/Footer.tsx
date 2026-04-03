"use client";

import React from 'react';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaXTwitter, 
  FaGithub, 
  FaLinkedin 
} from 'react-icons/fa6';
import { Activity } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-4">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand/Copyright Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-indigo-500" />
              <span className="text-white font-black uppercase tracking-tighter text-xl italic">
                MangaKart
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-xs font-medium uppercase tracking-widest text-slate-500">
              <p>© {currentYear} All Rights Reserved</p>
              <span className="hidden md:block text-slate-800">|</span>
              <p className="flex items-center gap-1">
                Crafted by <span className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors cursor-default">NV</span>
              </p>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/NaveenV-27" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
              aria-label="GitHub"
            >
              <FaGithub size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="https://www.linkedin.com/in/danthuluri-naveen-varma-6766a6344/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="https://www.instagram.com/nv.2762__/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
              aria-label="Instagram"
            >
              <FaInstagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="#" 
              target="_blank" 
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
              aria-label="X (Twitter)"
            >
              <FaXTwitter size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="https://www.facebook.com/naveenva.danthuluri/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
              aria-label="Facebook"
            >
              <FaFacebookF size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bottom Bar Accent */}
        {/* <div className="mt-10 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" /> */}
      </div>
    </footer>
  );
};

export default Footer;