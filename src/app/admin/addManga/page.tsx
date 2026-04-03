"use client";
import axios from 'axios';
import React, { useState } from 'react';
import { 
  BookPlus, 
  Upload, 
  Link as LinkIcon, 
  User, 
  Star, 
  Type, 
  Hash, 
  Loader2, 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Image from 'next/image';

interface MangaData {
  title: string;
  description: string;
  authors: string[];
  genres: string[];
  rating: number;
  coverImageFile: File | null;
  coverImageUrl: string;
}

const UploadMangaDataForm: React.FC = () => {
  const initialFormData: MangaData = {
    title: '',
    description: "",
    authors: [''],
    genres: [''],
    rating: 0,
    coverImageFile: null,
    coverImageUrl: '',
  };

  const [formData, setFormData] = useState<MangaData>(initialFormData);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'authors' || name === 'genres') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map((v) => v.trim()),
      }));
    } else if (name === 'rating') {
      setFormData((prev) => ({
        ...prev,
        rating: parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        coverImageFile: file,
      }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('authors', JSON.stringify(formData.authors));
    data.append('genres', JSON.stringify(formData.genres));
    data.append('rating', formData.rating.toString());

    if (formData.coverImageFile) {
      data.append('cover_image', formData.coverImageFile);
    } else {
      data.append('cover_image_url', formData.coverImageUrl);
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/create_manga`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      setMessage({ text: "Intel deployed successfully. Series created.", type: 'success' });
      setFormData(initialFormData);
      setPreviewUrl("");
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ text: "Deployment failed. Check system logs.", type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        <header className="bg-slate-900 border-b border-slate-800 p-8 text-center">
          <div className="inline-flex p-3 bg-indigo-600/10 rounded-2xl mb-4">
            <BookPlus className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Initialize Series</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Add a new manga to the archives</p>
        </header>

        <form onSubmit={onFormSubmit} className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Visual Data */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Upload size={12} /> Cover Asset
              </label>
              <div className="relative group aspect-[2/3] w-full max-w-[240px] mx-auto rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-500/50">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-bold uppercase">Upload File</p>
                  </div>
                )}
                <input
                  type="file"
                  name='cover_image'
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <LinkIcon size={12} /> External Asset URL
              </label>
              <input
                type="text"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://asset-cloud.com/image.jpg"
                className="upload-input"
              />
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={12} /> Series Title
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="One Piece" className="upload-input" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Star size={12} /> Rating (0.0 - 10.0)
              </label>
              <input type="number" name="rating" step="0.1" min="0" max="10" value={formData.rating} onChange={handleChange} placeholder="9.8" className="upload-input" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={12} /> Authors (CSV)
              </label>
              <input type="text" name="authors" value={formData.authors.join(', ')} onChange={handleChange} placeholder="Eiichiro Oda, Tite Kubo" className="upload-input" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Hash size={12} /> Genres (CSV)
              </label>
              <input type="text" name="genres" value={formData.genres.join(', ')} onChange={handleChange} placeholder="Action, Adventure, Shonen" className="upload-input" />
            </div>
          </div>

          {/* Bottom Row: Description */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Series Synopsis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the primary series narrative..."
              rows={4}
              className="upload-input min-h-[120px] py-3 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> Processing Intelligence...</> : 'Deploy Series'}
          </button>
        </form>
      </div>

      {/* Dynamic Toast Notification */}
      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold animate-in slide-in-from-bottom-10 ${message.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {message.text}
        </div>
      )}

      <style jsx>{`
        .upload-input {
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
        .upload-input:focus {
          border-color: #6366f1; /* indigo-500 */
          box-shadow: 0 0 0 1px #6366f1;
        }
        .upload-input::placeholder {
          color: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default UploadMangaDataForm;