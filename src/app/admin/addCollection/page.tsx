"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface MangaTitle {
  _id: string;
  title: string;
}

const AddCollection = () => {
  const [collectionName, setCollectionName] = useState('');
  const [allManga, setAllManga] = useState<MangaTitle[]>([]);
  const [selectedManga, setSelectedManga] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllManga = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/get_all_titles`);
        setAllManga(response.data);
      } catch (error) {
        console.error("Error fetching all manga:", error);
      }
    };
    fetchAllManga();
  }, []);

  const handleSelectManga = (mangaId: string) => {
    setSelectedManga(prev => {
      if (prev.includes(mangaId)) {
        return prev.filter(id => id !== mangaId);
      } else {
        return [...prev, mangaId];
      }
    });
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!collectionName || selectedManga.length === 0) {
      setMessage("Please enter a collection name and select at least one manga.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/create_collection`,
        {
          name: collectionName,
          manga_ids: selectedManga,
        }
      );
      console.log("Response", response.data);
      setMessage(`Collection '${collectionName}' created successfully!`);
      setCollectionName('');
      setSelectedManga([]);
    } catch (error) {
      console.error('Collection creation error:', error);
      setMessage('Failed to create collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[79vh] bg-gray-900 flex items-center justify-center p-6 w-full">
      <form onSubmit={onFormSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-white text-center">
          Create New Collection
        </h2>

        <label className="block mb-4">
          <span className="text-gray-400">Collection Name</span>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </label>
        
        <label className="block mb-6">
          <span className="text-gray-400">Select Manga to include:</span>
          <div className="mt-1 h-64 overflow-y-auto p-2 rounded bg-gray-700 border border-gray-600">
            {allManga.length > 0 ? (
              allManga.map(manga => (
                <div key={manga._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={manga._id}
                    checked={selectedManga.includes(manga._id)}
                    onChange={() => handleSelectManga(manga._id)}
                    className="form-checkbox text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                  />
                  <label htmlFor={manga._id} className="ml-2 text-gray-300">{manga.title}</label>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No manga available to add.</p>
            )}
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-300 disabled:bg-gray-500"
        >
          {isLoading ? 'Creating...' : 'Create Collection'}
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

export default AddCollection;