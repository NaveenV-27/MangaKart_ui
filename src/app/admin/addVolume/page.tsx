"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { IoSearch } from 'react-icons/io5';
import { 
  X, 
  Layers, 
  Upload, 
  Link as LinkIcon, 
  Hash, 
  Type, 
  IndianRupee, 
  Box, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MangaTitle {
  _id: string;
  title: string;
}

const AddVolume = () => {
  const [mangaQuery, setMangaQuery] = useState('');
  const [mangaResults, setMangaResults] = useState<MangaTitle[]>([]);
  const [selectedManga, setSelectedManga] = useState<MangaTitle | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [volumeNumber, setVolumeNumber] = useState('');
  const [volumeTitle, setVolumeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mangaQuery || selectedManga) {
      setMangaResults([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/search_manga`, {
          search: mangaQuery,
        }, { withCredentials: true });
        
        setMangaResults(response.data.results.map((m: {manga_id: string, title: string}) => (
          { _id: m.manga_id, title: m.title }
        )));
      } catch (error) {
        console.error(error)
        setMangaResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [mangaQuery, selectedManga]);

  const handleMangaSelect = (manga: MangaTitle) => {
    setSelectedManga(manga);
    setMangaQuery(manga.title);
    setMangaResults([]);
    setShowResults(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCoverImageUrl('');
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!selectedManga || !volumeNumber || !price || (!coverImageFile && !coverImageUrl)) {
      setMessage({ text: "Please provide all mandatory intel.", type: 'error' });
      setIsLoading(false);
      return;
    }

    const payload = {
      manga_id: selectedManga._id,
      volume_number: volumeNumber,
      title: volumeTitle,
      description,
      price,
      stock,
      cover_image_url : coverImageUrl
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/create_volume`, payload, { withCredentials: true });
      
      setMessage({ text: `Volume ${volumeNumber} deployed to ${selectedManga.title} archive.`, type: 'success' });
      
      // Reset form
      setSelectedManga(null);
      setVolumeNumber('');
      setVolumeTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setCoverImageFile(null);
      setCoverImageUrl('');
      setPreviewUrl(null);
      setMangaQuery('');
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Operation failed. Server denied entry.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        <header className="bg-slate-900 border-b border-slate-800 p-8 text-center">
          <div className="inline-flex p-3 bg-indigo-600/10 rounded-2xl mb-4">
            <Layers className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Add New Volume</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Link a volume to an existing series</p>
        </header>

        <form onSubmit={onFormSubmit} className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Association & Meta */}
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 flex items-center gap-2">
                <IoSearch size={12} /> Target Manga Series
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={mangaQuery}
                  onChange={(e) => {
                    setMangaQuery(e.target.value);
                    setShowResults(true);
                    if (selectedManga) setSelectedManga(null);
                  }}
                  className={`volume-input pl-4 pr-10 ${selectedManga ? 'border-emerald-500/50' : ''}`}
                  placeholder="Search series title..."
                  required
                />
                {isSearching ? (
                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin' size={18} />
                ) : (
                  <IoSearch className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500' size={18} />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && mangaResults.length > 0 && (
                <div className="absolute z-50 w-full bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl mt-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {mangaResults.map((manga) => (
                    <div
                      key={manga._id}
                      onClick={() => handleMangaSelect(manga)}
                      className="p-4 cursor-pointer hover:bg-indigo-600/10 hover:text-indigo-400 transition-all border-b border-slate-800 last:border-0 text-sm font-bold"
                    >
                      {manga.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Hash size={12} /> Vol Number
                </label>
                <input type="number" value={volumeNumber} onChange={(e) => setVolumeNumber(e.target.value)} className="volume-input" placeholder="01" required min="1" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Type size={12} /> Vol Title
                </label>
                <input type="text" value={volumeTitle} onChange={(e) => setVolumeTitle(e.target.value)} className="volume-input" placeholder="Sub-title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <IndianRupee size={12} /> Price
                </label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="volume-input" placeholder="₹" required step="0.01" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Box size={12} /> Stock
                </label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="volume-input" placeholder="Units" min="0" />
              </div>
            </div>
          </div>

          {/* Right Column: Imagery & Desc */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Upload size={12} /> Volume Cover
              </label>
              <div className="flex gap-4 items-start">
                <div className="relative group w-24 h-36 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-500/50 shrink-0">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-700" />
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input
                      type="text"
                      value={coverImageUrl}
                      onChange={(e) => {
                        setCoverImageUrl(e.target.value);
                        setCoverImageFile(null);
                        setPreviewUrl(null);
                      }}
                      className="volume-input pl-9 text-xs"
                      placeholder="Asset URL fallback"
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed tracking-tighter">
                    Upload a physical file or provide a secure cloud link.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Volume Summary</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="volume-input min-h-[114px] py-3 resize-none"
                placeholder="Details specific to this release..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedManga || isSearching}
            className="md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> Deploying Volume...</> : 'Add Volume to Library'}
          </button>
        </form>
      </div>

      {/* Modern Toast Notification */}
      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold animate-in slide-in-from-bottom-10 duration-300 ${message.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
          <button onClick={() => setMessage(null)} className='ml-2 opacity-50 hover:opacity-100 transition-opacity'><X size={18}/></button>
        </div>
      )}

      <style jsx>{`
        .volume-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          background-color: #020617; /* slate-950 */
          border: 1px solid #1e293b; /* slate-800 */
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .volume-input:focus {
          border-color: #6366f1; /* indigo-500 */
          box-shadow: 0 0 0 1px #6366f1;
        }
        .volume-input::placeholder {
          color: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default AddVolume;