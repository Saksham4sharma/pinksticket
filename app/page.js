"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ShowCard from "@/components/ShowCard";

export default function Home() {
  const [shows, setShows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get("/api/shows")
      .then((res) => {
        if (!cancelled) setShows(res.data || []);
      })
      .catch(() => !cancelled && setError("Failed to load shows"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-20">
        {/* Film strip background */}
        <div className="absolute inset-0 opacity-10">
          <div className="flex h-full animate-pulse">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-32 h-full border-l-4 border-r-4 border-yellow-400 bg-gradient-to-b from-yellow-900/20 to-transparent"></div>
            ))}
          </div>
        </div>
        
        {/* Spotlight effect */}
        <div className="absolute top-0 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-48 bg-yellow-400/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-red-600 text-white font-bold text-sm tracking-widest rounded-full mb-4">
              NOW SHOWING
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className="block text-yellow-400">CINEMA</span>
            <span className="block text-red-500">TICKETS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 font-light">
            Step into the magic of movies. Premium seats, blockbuster films, unforgettable experiences.
          </p>
          
          {/* Vintage ticket search */}
          <div className="max-w-lg mx-auto">
            <div className="relative bg-gradient-to-r from-yellow-400 to-red-500 p-1 rounded-lg">
              <div className="bg-black rounded-md p-4">
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for movies..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Film reel decorations */}
        <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-yellow-400 rounded-full animate-spin-slow opacity-30"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border-4 border-red-500 rounded-full animate-pulse opacity-40"></div>
      </section>

      {/* Movies Grid */}
      <section className="relative py-20 px-4">
        {/* Vintage section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <span className="text-yellow-400 font-bold tracking-[0.3em] text-sm">FEATURED</span>
            <div className="w-20 h-0.5 bg-gradient-to-l from-transparent to-yellow-400"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {query ? "SEARCH RESULTS" : "NOW PLAYING"}
          </h2>
          <p className="text-gray-400 text-lg">
            {query ? `Found movies matching "${query}"` : "The hottest films in theaters now"}
          </p>
        </div>

        {loading ? (
          /* Movie poster loading skeletons */
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-800 rounded animate-pulse mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-red-400 font-bold text-lg mb-2">Connection Error</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-gray-900/50 border border-gray-700/50 rounded-lg p-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-400/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v16a1 1 0 001 1h8a1 1 0 001-1V4" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No Movies Found</h3>
            <p className="text-gray-400">Check back soon for new releases!</p>
          </div>
        ) : (() => {
          const filteredShows = shows.filter((s) =>
            !query ? true : s.title?.toLowerCase().includes(query.toLowerCase())
          );
          
          return filteredShows.length === 0 ? (
            <div className="max-w-md mx-auto text-center bg-gray-900/50 border border-gray-700/50 rounded-lg p-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-400/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">No Movies Found</h3>
              <p className="text-gray-400">No movies match your search for "{query}"</p>
              <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
                {filteredShows.map((show) => (
                  <ShowCard key={show._id} show={show} />
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-400 mb-6">
            Have questions about bookings or need assistance? We're here to help!
          </p>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-6 h-6 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Email Us</h3>
            </div>
            <a 
              href="mailto:emailexample@email.com" 
              className="text-yellow-400 hover:text-yellow-300 text-lg font-medium transition-colors"
            >
              emailexample@email.com
            </a>
            <p className="text-gray-400 text-sm mt-2">
              We'll get back to you within 24 hours
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
