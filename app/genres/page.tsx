import Link from 'next/link';
import React from 'react'

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
        // "Kodomomuke"
    ];

    const getRandomDarkColor = (): string => {
    
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(50 + Math.random() * 30); // 50–80%
        const l = Math.floor(15 + Math.random() * 20); // 15–35%
        const a = 0.5; // Opacity between 0 (fully transparent) and 1 (fully opaque)
        return `hsla(${h},${s}%,${l}%,${a})`;
    };


    return (
        <div className='flex-center h-[79vh] flex-wrap gap-x-6 p-10'>
            {genres.map((genre) => {
                const bgColor = getRandomDarkColor();
                return <Link href={`/genres/${genre}`}
                  className={`min-w-30 p-4 h-28 text-2xl text-white flex-center rounded-lg`}
                  key={genre}
                  style={{ backgroundColor: bgColor }}
                  >
                    {genre}
                </Link>
            })}
        </div>
    )
}

export default page
