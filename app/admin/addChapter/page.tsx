"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface MangaTitle {
  _id: string;
  title: string;
}

const AddChapter = () => {
  const [mangaTitles, setMangaTitles] = useState<MangaTitle[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterImages, setChapterImages] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchMangaTitles = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_all_titles`);
        setMangaTitles(response.data);
      } catch (error) {
        console.error("Error fetching manga titles:", error);
      }
    };
    fetchMangaTitles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setChapterImages(Array.from(e.target.files));
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!selectedMangaId || !chapterNumber || chapterImages.length === 0) {
      setMessage("Please fill out all fields and select images.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('manga_id', selectedMangaId);
    formData.append('chapter_number', chapterNumber);
    chapterImages.forEach(file => {
      formData.append('chapter_images', file);
    });
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/add_chapter`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage(`Chapter ${chapterNumber} uploaded successfully!`);
      setChapterNumber('');
      setChapterImages([]);
      setSelectedMangaId('');
      // Optional: Redirect after success
      // router.push(`/manga/${selectedMangaId}`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[79vh] bg-gray-900 flex items-center justify-center p-6 w-full">
      <form onSubmit={onFormSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-white text-center">
          Add Chapter
        </h2>

        <label className="block mb-4">
          <span className="text-gray-400">Select Manga</span>
          <select
            value={selectedMangaId}
            onChange={(e) => setSelectedMangaId(e.target.value)}
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Select a Manga --</option>
            {mangaTitles.map(manga => (
              <option key={manga._id} value={manga._id}>
                {manga.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Chapter Number</span>
          <input
            type="number"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
          />
        </label>
        
        <label className="block mb-6">
          <span className="text-gray-400">Chapter Images (Select multiple)</span>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="mt-1 block w-full text-gray-300 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {chapterImages.length > 0 && (
            <p className="text-sm mt-2 text-gray-400">{chapterImages.length} file(s) selected.</p>
          )}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-300 disabled:bg-gray-500"
        >
          {isLoading ? 'Uploading...' : 'Add Chapter'}
        </button>
      </form>
      {message && (
        <div className="fixed top-40 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg bg-green-600 text-white font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddChapter;