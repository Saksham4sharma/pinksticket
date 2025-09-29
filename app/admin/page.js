"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { generateDefaultSeatMap } from "@/lib/defaultSeatMap";
import SeatMapPreview from "@/components/SeatMapPreview";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shows, setShows] = useState([]);
  const [editingShow, setEditingShow] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [seatMapPreview, setSeatMapPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    showtimes: "",
    seatMapType: "default", // default or custom
    totalSeats: 150,
  });

  const fetchShows = async () => {
    try {
      const res = await axios.get("/api/shows");
      setShows(res.data);
    } catch (error) {
      console.error("Failed to fetch shows:", error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // Generate seat map preview when type changes
  useEffect(() => {
    if (form.seatMapType === "default") {
      setSeatMapPreview(generateDefaultSeatMap());
    } else {
      setSeatMapPreview(null);
    }
  }, [form.seatMapType]);

  useEffect(() => {
    // Check admin status via API call for security
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await axios.post('/api/admin/check', {
            email: session.user.email
          });
          setIsAdmin(response.data.isAdmin || false);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
      setAdminCheckLoading(false);
    };

    if (session) {
      checkAdminStatus();
    } else if (status !== 'loading') {
      setAdminCheckLoading(false);
    }
  }, [session, status]);

  // Show loading while checking session or admin status
  if (status === "loading" || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message for non-admin users
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please login to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-3xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-2">You don't have permission to access this page.</p>
          <p className="text-gray-500 text-sm mb-6">Contact an administrator for access.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Function to parse 12-hour format datetime
  const parseShowtime = (timeString) => {
    try {
      const trimmed = timeString.trim();
      if (!trimmed) return null;

      // Handle different formats
      // Format: "2024-12-25 7:00 PM" or "2024-12-25 07:00 PM"
      const dateTimeRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
      const match = trimmed.match(dateTimeRegex);

      if (match) {
        const [, datePart, hour, minute, ampm] = match;
        let hour24 = parseInt(hour);
        
        if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
          hour24 = 0;
        }

        const dateTimeString = `${datePart}T${hour24.toString().padStart(2, '0')}:${minute}:00`;
        return new Date(dateTimeString);
      }

      // Fallback: try to parse as regular date
      const fallbackDate = new Date(trimmed);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }

      console.warn(`Could not parse showtime: ${trimmed}`);
      return null;
    } catch (error) {
      console.error(`Error parsing showtime: ${timeString}`, error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse showtimes from newline-separated format
    const showtimesArray = form.showtimes
      .split('\n')
      .map(line => parseShowtime(line))
      .filter(date => date !== null);

    if (showtimesArray.length === 0) {
      alert('Please provide at least one valid showtime in the format: YYYY-MM-DD HH:MM AM/PM');
      return;
    }
    
    // Generate seat map based on selected type
    let seatMap;
    if (form.seatMapType === "default") {
      seatMap = generateDefaultSeatMap();
    } else {
      // For custom, create a simple grid for now
      seatMap = generateDefaultSeatMap(); // We can enhance this later
    }

    try {
      const showData = {
        title: form.title,
        description: form.description,
        posterUrl: form.posterUrl,
        trailerUrl: form.trailerUrl,
        showtimes: showtimesArray,
        seatMapType: form.seatMapType,
        seatMap: seatMap,
        totalSeats: seatMap.flat().filter(seat => seat !== null).length
      };

      if (editingShow) {
        await axios.put(`/api/shows/${editingShow._id}`, showData);
        alert("Show updated!");
        setEditingShow(null);
      } else {
        await axios.post("/api/shows", showData);
        alert("Show created!");
      }
      
      setForm({
        title: "",
        description: "",
        posterUrl: "",
        trailerUrl: "",
        showtimes: "",
        seatMapType: "default",
        totalSeats: 150,
      });
      setSeatMapPreview(null);
      fetchShows();
    } catch (error) {
      alert("Error saving show: " + error.message);
    }
  };

  // Function to format datetime to 12-hour format
  const formatShowtime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error(`Error formatting showtime: ${dateString}`, error);
      return '';
    }
  };

  const handleEdit = (show) => {
    setEditingShow(show);
    setForm({
      title: show.title,
      description: show.description,
      posterUrl: show.posterUrl,
      trailerUrl: show.trailerUrl,
      showtimes: show.showtimes.map(t => formatShowtime(t)).join('\n'),
      seatMapType: show.seatMapType || "default",
      totalSeats: show.totalSeats || 150,
    });
    // Set preview to current seat map
    setSeatMapPreview(show.seatMap || generateDefaultSeatMap());
  };

  const handleDelete = async (showId) => {
    if (!confirm("Are you sure you want to delete this show?")) return;
    
    try {
      await axios.delete(`/api/shows/${showId}`);
      alert("Show deleted!");
      fetchShows();
    } catch (error) {
      alert("Error deleting show: " + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingShow(null);
    setForm({
      title: "",
      description: "",
      posterUrl: "",
      trailerUrl: "",
      showtimes: "",
      seatMapType: "default",
      totalSeats: 150,
    });
    setSeatMapPreview(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Film strip background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-yellow-600 p-3 shadow-lg">
              <svg fill="currentColor" viewBox="0 0 24 24" className="h-full w-full text-white">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              THEATER <span className="text-red-500">MANAGER</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Control room for movie theater operations</p>
          <div className="w-32 h-1 bg-gradient-to-r from-red-600 to-yellow-600 mx-auto mt-4"></div>
        </div>
        
        {/* Create/Edit Form */}
        <div className="mb-8 overflow-hidden rounded-lg bg-gray-900/80 border border-gray-800 shadow-2xl backdrop-blur-md">
          <div className="border-b border-gray-800 bg-gradient-to-r from-red-900/30 to-yellow-900/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span className="text-2xl">{editingShow ? "🎬" : "🎯"}</span>
                  <span>{editingShow ? "EDIT MOVIE" : "ADD NEW MOVIE"}</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {editingShow ? "Update movie information and schedule" : "Register a new movie in the theater system"}
                </p>
              </div>
              {editingShow && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">🎬 Movie Title</label>
                <input
                  type="text"
                  placeholder="Enter the movie title..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">🖼️ Poster URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">🎥 Trailer URL</label>
                <input
                  type="url"
                  placeholder="YouTube, Vimeo URL (e.g., https://www.youtube.com/watch?v=...)"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                  value={form.trailerUrl}
                  onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supports YouTube (youtube.com/watch or youtu.be) and Vimeo URLs
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">📝 Description</label>
                <textarea
                  placeholder="Enter movie description..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">⏰ Showtimes</label>
                <textarea
                  placeholder="Enter showtimes (one per line):&#10;2024-12-25 7:00 PM&#10;2024-12-25 9:30 PM&#10;2024-12-26 2:00 PM&#10;2024-12-26 7:00 PM"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                  rows="4"
                  value={form.showtimes}
                  onChange={(e) => setForm({ ...form, showtimes: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: YYYY-MM-DD HH:MM AM/PM (one per line). Examples: "2024-12-25 7:00 PM" or "2024-12-26 2:30 PM"
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">🪑 Seat Map Configuration</label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Seat Map Type</label>
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      value={form.seatMapType}
                      onChange={(e) => setForm({ ...form, seatMapType: e.target.value })}
                    >
                      <option value="default">Default Layout (150 seats)</option>
                      <option value="custom">Custom Layout</option>
                    </select>
                  </div>
                  
                  {form.seatMapType === "default" && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-sm text-gray-300 mb-2">
                        <span className="text-yellow-400 font-semibold">Default Layout:</span> 150 seats with Premium (20), Regular (96), and Economy (34) sections
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span className="text-gray-300">Premium: ₹250</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-gray-300">Regular: ₹180</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-gray-300">Economy: ₹120</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {form.seatMapType === "custom" && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-sm text-yellow-400 mb-2">Custom Layout</p>
                      <p className="text-xs text-gray-400">Custom seat map builder coming soon. For now, default layout will be used.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Seat Map Preview */}
              {seatMapPreview && (
                <div className="md:col-span-2 w-full">
                  <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">🎭 Seat Map Preview</label>
                  <div className="w-full overflow-x-auto bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <SeatMapPreview seatMap={seatMapPreview} interactive={false} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-yellow-600 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-red-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{editingShow ? "🎬 UPDATE MOVIE" : "🎯 ADD MOVIE"}</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            </div>
          </form>
        </div>

        {/* Shows List */}
        <div className="overflow-hidden rounded-lg bg-gray-900/80 border border-gray-800 shadow-2xl backdrop-blur-md">
          <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-red-900/30 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="text-2xl">�</span>
              <span>MOVIE CATALOG</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">Manage all movies in your theater</p>
          </div>
          
          <div className="p-6">
            {shows.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800/50 border border-gray-700">
                  <svg className="h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v16a1 1 0 001 1h8a1 1 0 001-1V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Movies in Catalog</h3>
                <p className="text-gray-400">Add your first movie using the form above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shows.map((show) => (
                  <div key={show._id} className="group rounded-lg border border-gray-700 bg-gray-800/30 p-4 transition-all hover:border-yellow-400/50 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-yellow-400/10">
                    <div className="flex items-start gap-4">
                      {show.posterUrl && (
                        <div className="flex-shrink-0">
                          <img 
                            src={show.posterUrl} 
                            alt={show.title}
                            className="h-32 w-20 rounded-lg object-cover shadow-lg border-2 border-gray-700 group-hover:border-yellow-400/50 transition-all"
                          />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">{show.title}</h3>
                            <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                              {show.description || "No description provided"}
                            </p>
                            
                            <div className="mt-4 flex flex-wrap gap-3 text-xs">
                              <span className="flex items-center gap-1 rounded-full bg-blue-600/20 border border-blue-600/50 px-3 py-1 text-blue-300">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {show.seatMap ? show.seatMap.flat().filter(seat => seat !== null).length : show.totalSeats || 0} total seats
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-green-600/20 border border-green-600/50 px-3 py-1 text-green-300">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {show.seatMap ? show.seatMap.flat().filter(seat => seat && seat.available).length : show.totalSeats || 0} available
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-purple-600/20 border border-purple-600/50 px-3 py-1 text-purple-300">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {show.showtimes?.length || 0} showtimes
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(show)}
                              className="rounded-lg bg-yellow-600/20 border border-yellow-600/50 px-4 py-2 text-sm font-bold text-yellow-400 transition-all hover:bg-yellow-600/30 hover:text-yellow-300"
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              onClick={() => handleDelete(show._id)}
                              className="rounded-lg bg-red-600/20 border border-red-600/50 px-4 py-2 text-sm font-bold text-red-400 transition-all hover:bg-red-600/30 hover:text-red-300"
                            >
                              🗑️ DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
