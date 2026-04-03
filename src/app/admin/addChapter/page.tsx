// "use client";

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useRouter } from 'next/navigation';

// // interface MangaTitle {
// //   _id: string;
// //   title: string;
// // }

// const AddChapter = () => {
//   // const [mangaTitles, setMangaTitles] = useState<MangaTitle[]>([]);
//   // const [selectedMangaId, setSelectedMangaId] = useState('');
//   // const [chapterNumber, setChapterNumber] = useState('');
//   // const [chapterImages, setChapterImages] = useState<File[]>([]);
//   // const [message, setMessage] = useState('');
//   // const [isLoading, setIsLoading] = useState(false);

//   // useEffect(() => {
//   //   const fetchMangaTitles = async () => {
//   //     try {
//   //       const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_all_titles`);
//   //       setMangaTitles(response.data);
//   //     } catch (error) {
//   //       console.error("Error fetching manga titles:", error);
//   //     }
//   //   };
//   //   fetchMangaTitles();
//   // }, []);

//   // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   if (e.target.files) {
//   //     setChapterImages(Array.from(e.target.files));
//   //   }
//   // };

//   // const onFormSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setIsLoading(true);
//   //   setMessage('');

//   //   if (!selectedMangaId || !chapterNumber || chapterImages.length === 0) {
//   //     setMessage("Please fill out all fields and select images.");
//   //     setIsLoading(false);
//   //     return;
//   //   }

//   //   const formData = new FormData();
//   //   formData.append('manga_id', selectedMangaId);
//   //   formData.append('chapter_number', chapterNumber);
//   //   chapterImages.forEach(file => {
//   //     formData.append('chapter_images', file);
//   //   });
    
//   //   try {
//   //     const response = await axios.post(
//   //       `${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/add_chapter`,
//   //       formData,
//   //       {
//   //         headers: {
//   //           'Content-Type': 'multipart/form-data',
//   //         },
//   //         withCredentials: true
//   //       }
//   //     );
//   //     console.log("Response", response.data);
//   //     setMessage(`Chapter ${chapterNumber} uploaded successfully!`);
//   //     setChapterNumber('');
//   //     setChapterImages([]);
//   //     setSelectedMangaId('');
//   //     // Optional: Redirect after success
//   //     // router.push(`/manga/${selectedMangaId}`);
//   //   } catch (error) {
//   //     console.error('Upload error:', error);
//   //     setMessage('Upload failed. Please try again.');
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // return (
//   //   <div className="min-h-[79vh] bg-gray-900 flex items-center justify-center p-6 w-full">
//   //     <form onSubmit={onFormSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-200">
//   //       <h2 className="text-3xl font-semibold mb-6 text-white text-center">
//   //         Add Chapter
//   //       </h2>

//   //       <label className="block mb-4">
//   //         <span className="text-gray-400">Select Manga</span>
//   //         <select
//   //           value={selectedMangaId}
//   //           onChange={(e) => setSelectedMangaId(e.target.value)}
//   //           className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
//   //           required
//   //         >
//   //           <option value="">-- Select a Manga --</option>
//   //           {mangaTitles.map(manga => (
//   //             <option key={manga._id} value={manga._id}>
//   //               {manga.title}
//   //             </option>
//   //           ))}
//   //         </select>
//   //       </label>

//   //       <label className="block mb-4">
//   //         <span className="text-gray-400">Chapter Number</span>
//   //         <input
//   //           type="number"
//   //           value={chapterNumber}
//   //           onChange={(e) => setChapterNumber(e.target.value)}
//   //           className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
//   //           required
//   //           min="1"
//   //         />
//   //       </label>
        
//   //       <label className="block mb-6">
//   //         <span className="text-gray-400">Chapter Images (Select multiple)</span>
//   //         <input
//   //           type="file"
//   //           onChange={handleFileChange}
//   //           multiple
//   //           accept="image/*"
//   //           className="mt-1 block w-full text-gray-300 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
//   //           required
//   //         />
//   //         {chapterImages.length > 0 && (
//   //           <p className="text-sm mt-2 text-gray-400">{chapterImages.length} file(s) selected.</p>
//   //         )}
//   //       </label>

//   //       <button
//   //         type="submit"
//   //         disabled={isLoading}
//   //         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-300 disabled:bg-gray-500"
//   //       >
//   //         {isLoading ? 'Uploading...' : 'Add Chapter'}
//   //       </button>
//   //     </form>
//   //     {message && (
//   //       <div className="fixed top-40 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg bg-green-600 text-white font-semibold">
//   //         {message}
//   //       </div>
//   //     )}
//   //   </div>
//   // );
// };

// export default AddChapter;

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Construction, 
  ChevronLeft, 
  Settings, 
  Wrench, 
  Terminal, 
  Home 
} from 'lucide-react';

const UnderDevelopment = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Aesthetic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-xl text-center">
        
        {/* Main Icon Stack */}
        <div className="relative inline-flex mb-8">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative z-10">
            <Construction className="w-16 h-16 text-indigo-500 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl animate-bounce duration-1000">
            <Settings className="w-6 h-6 text-slate-400" />
          </div>
          <div className="absolute -bottom-2 -left-2 p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl animate-pulse">
            <Terminal className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          Protocol Pending
        </h1>
        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
          The <span className="text-indigo-400 font-black">This feature</span> is currently under deep-level construction. Our engineers are deploying the final architecture.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} />
            Go Back
          </button>
          
          <button
            onClick={() => router.push('/admin')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Admin HQ
          </button>
        </div>

        {/* Technical Status Bar */}
        <div className="mt-16 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dev Active</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-slate-500">
            <Wrench size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Build 0.4.2-Alpha</span>
          </div>
        </div>
      </div>

      {/* Decorative Grid Line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </div>
  );
};

export default UnderDevelopment;