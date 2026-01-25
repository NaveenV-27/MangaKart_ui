import Link from "next/link";
import React from "react";

const genreColors: { [key: string]: string } = {
  Action: "hsla(0, 70%, 30%, 0.85)",
  Adventure: "hsla(45, 70%, 30%, 0.85)",
  Comedy: "hsla(60, 70%, 30%, 0.85)",
  Drama: "hsla(240, 70%, 30%, 0.85)",
  Fantasy: "hsla(270, 70%, 30%, 0.85)",
  Horror: "hsla(300, 70%, 15%, 0.85)",
  Mystery: "hsla(210, 70%, 25%, 0.85)",
  Romance: "hsla(330, 70%, 40%, 0.85)",
  "Sci-Fi": "hsla(200, 70%, 20%, 0.85)",
  "Slice of Life": "hsla(120, 30%, 35%, 0.85)",
  Sports: "hsla(150, 70%, 30%, 0.85)",
  Supernatural: "hsla(340, 70%, 25%, 0.85)",
  Ecchi: "hsla(30, 70%, 40%, 0.85)",
  Harem: "hsla(315, 70%, 35%, 0.85)",
  Isekai: "hsla(280, 70%, 30%, 0.85)",
  Mecha: "hsla(190, 70%, 30%, 0.85)",
  Psychological: "hsla(250, 70%, 20%, 0.85)",
  Thriller: "hsla(20, 70%, 25%, 0.85)",
  "Yaoi (Boys' Love)": "hsla(260, 70%, 45%, 0.85)",
  "Yuri (Girls' Love)": "hsla(330, 70%, 45%, 0.85)",
  "Shonen-manga": "hsla(10, 70%, 40%, 0.85)",
  "Shojo-manga": "hsla(300, 70%, 50%, 0.85)",
  "Seinen-manga": "hsla(240, 70%, 40%, 0.85)",
  "Josei-manga": "hsla(280, 70%, 50%, 0.85)",
};

const page = () => {
  const genres = Object.keys(genreColors);

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-semibold text-slate-100">
          Browse by Genre
        </h1>
        <p className="text-slate-400 mt-2">
          Discover manga by your favorite genres
        </p>
      </div>

      {/* Genre Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {genres.map((genre) => {
          const bgColor =
            genreColors[genre] || "hsla(0, 0%, 20%, 0.8)";

          return (
            <Link
              key={genre}
              href={`/genres/${encodeURIComponent(genre)}`}
              className="group relative rounded-xl overflow-hidden
                         border border-slate-700
                         transition-all duration-300
                         hover:scale-[1.03] hover:border-slate-500"
            >
              <div
                className="h-28 flex items-center justify-center text-center
                           text-slate-100 font-medium tracking-wide px-3"
                style={{ backgroundColor: bgColor }}
              >
                <span className="text-lg group-hover:tracking-wider transition-all">
                  {genre}
                </span>
              </div>

              {/* subtle overlay for polish */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default page;
