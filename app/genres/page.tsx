import Link from 'next/link';
import React from 'react';

const genreColors: { [key: string]: string } = {
  "Action": "hsla(0, 70%, 30%, 0.8)",
  "Adventure": "hsla(45, 70%, 30%, 0.8)",
  "Comedy": "hsla(60, 70%, 30%, 0.8)",
  "Drama": "hsla(240, 70%, 30%, 0.8)",
  "Fantasy": "hsla(270, 70%, 30%, 0.8)",
  "Horror": "hsla(300, 70%, 15%, 0.8)",
  "Mystery": "hsla(210, 70%, 25%, 0.8)",
  "Romance": "hsla(330, 70%, 40%, 0.8)",
  "Sci-Fi": "hsla(200, 70%, 20%, 0.8)",
  "Slice of Life": "hsla(120, 30%, 50%, 0.8)",
  "Sports": "hsla(150, 70%, 30%, 0.8)",
  "Supernatural": "hsla(340, 70%, 25%, 0.8)",
  "Ecchi": "hsla(30, 70%, 40%, 0.8)",
  "Harem": "hsla(315, 70%, 35%, 0.8)",
  "Isekai": "hsla(280, 70%, 30%, 0.8)",
  "Mecha": "hsla(190, 70%, 30%, 0.8)",
  "Psychological": "hsla(250, 70%, 20%, 0.8)",
  "Thriller": "hsla(20, 70%, 25%, 0.8)",
  "Yaoi (Boys' Love)": "hsla(260, 70%, 45%, 0.8)",
  "Yuri (Girls' Love)": "hsla(330, 70%, 45%, 0.8)",
  "Shonen-manga": "hsla(10, 70%, 40%, 0.8)",
  "Shojo-manga": "hsla(300, 70%, 50%, 0.8)",
  "Seinen-manga": "hsla(240, 70%, 40%, 0.8)",
  "Josei-manga": "hsla(280, 70%, 50%, 0.8)",
};

const page = () => {
  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Ecchi",
    "Harem",
    "Isekai",
    "Mecha",
    "Psychological",
    "Thriller",
    "Yaoi (Boys' Love)",
    "Yuri (Girls' Love)",
    "Shonen-manga",
    "Shojo-manga",
    "Seinen-manga",
    "Josei-manga",
  ];

  return (
    <div className='flex-center h-[79vh] flex-wrap gap-x-6 p-10'>
      {genres.map((genre) => {
        const bgColor = genreColors[genre] || 'hsla(0, 0%, 20%, 0.8)'; // Fallback color
        return (
          <Link
            href={`/genres/${genre}`}
            className={`min-w-30 p-4 h-28 text-2xl text-white flex-center rounded-lg`}
            key={genre}
            style={{ backgroundColor: bgColor }}
          >
            {genre}
          </Link>
        );
      })}
    </div>
  );
};

export default page;