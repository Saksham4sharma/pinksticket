"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function UpcomingMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const upcomingIndianMovies = [
    {
      id: 1,
      title: "Avatar: Fire and Ash",
      releaseDate: "2025-12-19",
      genre: "Action, Adventure, Fantasy, Sci-Fi",
      language: "English/Hindi",
      director: "James Cameron",
      cast: "Sam Worthington, Zoe Saldana",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MTksIERlYyAyMDI1,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00407893-jxncwqckbj-portrait.jpg",
      description: "The highly anticipated third installment in the Avatar franchise continues the epic journey on Pandora."
    },
    {
      id: 2,
      title: "Toxic: A Fairy Tale for Grown-ups",
      releaseDate: "2025-04-10",
      genre: "Action, Thriller",
      language: "Kannada/Hindi",
      director: "Geetu Mohandas",
      cast: "Yash, Kiara Advani",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MTksIE1hciAyMDI2,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00378770-fshzjevtnf-portrait.jpg",
      description: "KGF star Yash returns in a dark and gritty action thriller set in the underworld."
    },
    {
      id: 3,
      title: "The Raja Saab",
      releaseDate: "2025-04-10",
      genre: "Comedy, Horror, Romance",
      language: "Telugu/Hindi",
      director: "Maruthi",
      cast: "Prabhas, Malvika Mohanan",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-OSwgSmFuIDIwMjY%3D,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00383697-afurkbzhfd-portrait.jpg",
      description: "Prabhas in a unique horror-comedy featuring romance and supernatural elements."
    },
    {
      id: 4,
      title: "Baahubali: The Epic",
      releaseDate: "2025-05-15",
      genre: "Action, Drama, Fantasy",
      language: "Telugu/Hindi",
      director: "S.S. Rajamouli",
      cast: "Prabhas, Rana Daggubati",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MzEsIE9jdCAyMDI1,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00453094-jgrsetmbjh-portrait.jpg",
      description: "A new epic chapter in the legendary Baahubali universe with stunning visuals."
    },
    {
      id: 5,
      title: "Border 2",
      releaseDate: "2026-01-23",
      genre: "Action, Drama, War",
      language: "Hindi",
      director: "Anurag Singh",
      cast: "Sunny Deol, Varun Dhawan",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MjIsIEphbiAyMDI2,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00401449-duyzcnthuq-portrait.jpg",
      description: "The sequel to the classic war film Border, honoring the Indian Army."
    },
    {
      id: 6,
      title: "Bhooth Bangla",
      releaseDate: "2025-10-31",
      genre: "Comedy, Horror, Thriller",
      language: "Hindi",
      director: "Priyadarshan",
      cast: "Akshay Kumar, Tabu",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MiwgQXByIDIwMjY%3D,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00411383-jcbpzpngwc-portrait.jpg",
      description: "A horror-comedy featuring a haunted mansion and supernatural encounters."
    },
    {
      id: 7,
      title: "Thamma",
      releaseDate: "2025-06-13",
      genre: "Comedy, Horror, Romance",
      language: "Bengali/Hindi",
      director: "Srijit Mukherji",
      cast: "Anushka Sharma",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MjEsIE9jdCAyMDI1,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00443268-mlpknxwvbk-portrait.jpg",
      description: "A unique blend of comedy, horror and romance set in rural Bengal."
    },
    {
      id: 8,
      title: "The Paradise",
      releaseDate: "2025-12-06",
      genre: "Action, Adventure, Drama",
      language: "English/Hindi",
      director: "Christopher Nolan",
      cast: "Christian Bale, Anne Hathaway",
      poster: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-text,ie-MjYsIE1hciAyMDI2,fs-29,co-FFFFFF,ly-612,lx-24,pa-8_0_0_0,l-end/et00436621-bwzrkbfcuk-portrait.jpg",
      description: "A mind-bending adventure that explores the concept of paradise and reality."
    },
  ];

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setMovies(upcomingIndianMovies);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-yellow-400 mb-4">
              UPCOMING MOVIES
            </h1>
            <p className="text-gray-400 text-lg">Loading the most anticipated Indian films...</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-red-600/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-yellow-400 mb-4">
            UPCOMING MOVIES
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Get ready for the most anticipated Indian films coming to theaters soon
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                      
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
            >
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    {movie.language}
                  </span>
                </div>
              </div>

              {/* Movie Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {movie.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(movie.releaseDate)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {movie.genre}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {movie.director}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {movie.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Starring: {movie.cast}
                  </span>
                  <div className="flex items-center text-yellow-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-900/50 border-t border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated with Latest Releases
          </h2>
          <p className="text-gray-400 mb-6">
            Don't miss out on the biggest blockbusters coming to theaters
          </p>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg transition-colors">
            Get Notifications
          </button>
        </div>
      </div>
    </div>
  );
}