"use client";
import React from 'react';
import { X } from 'lucide-react';

const genresList = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", 
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", 
  "Supernatural", "Ecchi", "Harem", "Isekai", "Mecha", 
  "Psychological", "Thriller", "Shonen-manga", "Shojo-manga", 
  "Seinen-manga", "Josei-manga"
];

const sortOptions = [
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "rating_desc", label: "Rating (High to Low)" },
  { value: "rating_asc", label: "Rating (Low to High)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

interface FiltersSideBarProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const FiltersSideBar = ({
  selectedGenres,
  onGenreChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: FiltersSideBarProps) => {

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const hasActiveFilters = selectedGenres.length > 0 || sortBy !== "title_asc";

  return (
    <div className='h-fit sticky top-4 w-72 bg-[#1b2531] rounded-xl p-5 shadow-xl scrollbar'>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-xl font-bold text-white'>Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className='text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors'
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className='mb-6'>
        <h3 className='text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider'>Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className='w-full bg-[#2a3441] text-gray-200 rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors'
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Genres */}
      <div>
        <h3 className='text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider'>Genres</h3>
        <div className='flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1'>
          {genresList.map(genre => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-[#2a3441] text-gray-300 hover:bg-[#3a4451] hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Genres Count */}
      {selectedGenres.length > 0 && (
        <div className='mt-4 pt-4 border-t border-gray-700'>
          <p className='text-sm text-gray-400'>
            {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default FiltersSideBar;
