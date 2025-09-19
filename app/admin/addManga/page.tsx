"use client";
import axios from 'axios';
import React, { useState } from 'react';

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
  const [previewUrl, setPreviewUrl] = useState<any>(null);
  const [message, setMessage] = useState('');
  
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'authors' || name === 'genres') {
      // Split by comma for authors and genres
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
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        console.log(url)
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    console.log("Submitting form with data:", data);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/create_manga`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Response:", response.data, response.data.data.cover_image);
      setMessage(`Upload successful! URL: ${response.data.data.cover_image}`);
      setFormData(initialFormData);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 w-full">
      <form
        onSubmit={onFormSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-200"
      >
        <h2 className="text-3xl font-semibold mb-6 text-white text-center">
          Upload Manga Data
        </h2>

        <label className="block mb-4">
          <span className="text-gray-400">Cover Image File</span>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '200px', marginTop: '12px', borderRadius: '8px' }}
            />
          )}
          <input
            type="file"
            name='cover_image'
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-gray-300 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500 "
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Or Cover Image URL</span>
          <input
            type="text"
            name="coverImageUrl"
            value={formData.coverImageUrl}
            onChange={handleChange}
            placeholder="Image URL"
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Title</span>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={4}
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Authors (comma separated)</span>
          <input
            type="text"
            name="authors"
            value={formData.authors.join(', ')}
            onChange={handleChange}
            placeholder="Authors"
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Genres (comma separated)</span>
          <input
            type="text"
            name="genres"
            value={formData.genres.join(', ')}
            onChange={handleChange}
            placeholder="Genres"
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-400">Rating</span>
          <input
            type="number"
            name="rating"
            step="0.1"
            min="0"
            max="10"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating"
            className="mt-1 block w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-300"
        >
          Upload
        </button>
      </form>
      <div
      className={`
        fixed top-40 left-1/2 transform -translate-x-1/2 
        z-50 px-6 py-3 rounded shadow-lg 
        bg-green-600 text-white font-semibold 
        transition-opacity duration-500 
        ${message ? 'opacity-100 animate-fadeInDown' : 'opacity-0 pointer-events-none'}
      `}
      role="alert"
    >
      {message}
    </div>
    </div>
  );
};

export default UploadMangaDataForm;
