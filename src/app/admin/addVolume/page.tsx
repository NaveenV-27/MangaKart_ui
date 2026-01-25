"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IoSearch } from 'react-icons/io5';
import { X } from 'lucide-react';

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
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!mangaQuery) {
      setMangaResults([]);
      return;
    }

    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/search_manga`, {
          search: mangaQuery,
        }, {
          withCredentials: true
        });
        // Correctly handle the response format
        // console.log("Manga search response:", response.data);
        setMangaResults(response.data.results.map((m: {manga_id : string; title: string;}) => ({ _id: m.manga_id, title: m.title })));
      } catch (error) {
        console.error("Error searching manga titles:", error);
        setMangaResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [mangaQuery]);

  const handleMangaSelect = (manga: MangaTitle) => {
    console.log("Selected manga:", manga);
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
      setCoverImageUrl(''); // Clear URL field if file is selected
    } else {
      setCoverImageFile(null);
      setPreviewUrl(null);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!selectedManga || !volumeNumber || !price || (!coverImageFile && !coverImageUrl)) {
      setMessage("Please fill out all required fields.");
      setIsLoading(false);
      return;
    }

    // const formData = new FormData();
    // formData.append('manga_id', selectedManga._id);
    // formData.append('volume_number', volumeNumber);
    // formData.append('title', volumeTitle);
    // formData.append('description', description);
    // formData.append('price', price);
    // formData.append('stock', stock);

    // if (coverImageFile) {
    //   formData.append('cover_image', coverImageFile);
    // } else if (coverImageUrl) {
    //   formData.append('cover_image_url', coverImageUrl);
    // }
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
      console.log("FormData:", payload);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/create_volume`, 
        payload,
        {
          // headers: {
          //   'Content-Type': 'multipart/form-data',
          // }, 
          withCredentials: true
        }
      );
      setMessage(`Volume ${volumeNumber} added successfully to ${selectedManga.title}!`);
      // Reset form fields
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
      console.log("Response from API:", response.data);
      setTimeout(()=> {
        setMessage("");
      }, 5000)
    } catch (error) {
      console.error('Add volume error:', error);
      setMessage('Failed to add volume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[79vh] bg-gray-900 flex items-center justify-center p-6 w-full">
      <form onSubmit={onFormSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-white text-center">
          Add Volume
        </h2>

        {/* Manga Search */}
        <div className="mb-4 relative">
          <label className="block mb-2">
            <span className="text-gray-400">Select Manga</span>
            <div className="relative">
              <input
                type="text"
                value={selectedManga ? selectedManga.title : mangaQuery}
                onChange={(e) => {
                  setMangaQuery(e.target.value);
                  setShowResults(true);
                  setSelectedManga(null);
                }}
                className="mt-1 block w-full p-2 pr-10 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a manga..."
                required
              />
              <IoSearch className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            </div>
          </label>
          
          {isSearching && mangaQuery.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full max-w-lg p-3 rounded-md shadow-lg bg-gray-800 text-gray-400 text-sm">
                Searching...
            </div>
          )}
          {showResults && mangaResults.length > 0 && (
            <div className="absolute z-10 w-full max-w-lg bg-gray-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {mangaResults.map((manga) => (
                <div
                  key={manga._id}
                  onClick={() => handleMangaSelect(manga)}
                  className="p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  {manga.title}
                </div>
              ))}
            </div>
          )}
          {selectedManga && (
            <p className="mt-2 text-sm text-blue-400">
              Selected: <span className="font-semibold">{selectedManga.title}</span>
            </p>
          )}
        </div>

        {/* Volume Number & Title */}
        <div className="flex gap-4 mb-4">
          <label className="block flex-1">
            <span className="text-gray-400">Volume Number</span>
            <input
              type="number"
              value={volumeNumber}
              onChange={(e) => setVolumeNumber(e.target.value)}
              className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
            />
          </label>
          <label className="block flex-1">
            <span className="text-gray-400">Volume Title (Optional)</span>
            <input
              type="text"
              value={volumeTitle}
              onChange={(e) => setVolumeTitle(e.target.value)}
              className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., The Journey Begins"
            />
          </label>
        </div>
        
        {/* Description */}
        <label className="block mb-4">
          <span className="text-gray-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Enter a description for the volume..."
          />
        </label>

        {/* Price & Stock */}
        <div className="flex gap-4 mb-4">
          <label className="block flex-1">
            <span className="text-gray-400">Price (₹)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </label>
          <label className="block flex-1">
            <span className="text-gray-400">Stock</span>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        {/* Cover Image Upload */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-400">Cover Image File</span>
            <input
              type="file"
              name='cover_image'
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-gray-300 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            />
          </label>
          {previewUrl && (
            <div className="mt-2 w-48 h-auto overflow-hidden rounded-lg">
              <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover"/>
            </div>
          )}
          <p className="text-center text-gray-500 my-2">-- OR --</p>
          <label className="block">
            <span className="text-gray-400">Cover Image URL</span>
            <input
              type="text"
              name="cover_image_url"
              value={coverImageUrl}
              onChange={(e) => {
                setCoverImageUrl(e.target.value);
                setCoverImageFile(null); // Clear file input
                setPreviewUrl(null); // Clear preview
              }}
              className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter image URL"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedManga || isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-300 disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Volume...' : 'Add Volume'}
        </button>
      </form>
      {message && (
        <div className="fixed flex items-center gap-2 top-40 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg bg-green-600 text-white font-semibold">
          {message}
          <button className='cursor-pointer' onClick={() => setMessage("")}><X/></button>
        </div>
      )}
    </div>
  );
};

export default AddVolume;