"use client";
import { useEffect, useState, use } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ShowDetails({ params }) {
  const { data: session } = useSession();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  // In Next.js 15, params in Client Components is a Promise. Unwrap with React.use().
  const { id: showId } = use(params);

  useEffect(() => {
    if (!showId) return;
    axios.get(`/api/shows/${showId}`).then((res) => {
      setShow(res.data);
      if (res.data.showtimes && res.data.showtimes.length > 0) {
        setSelectedShowtime(res.data.showtimes[0]);
      }
    });
  }, [showId]);

  // Fetch current user data for gender-based seat display
  useEffect(() => {
    if (session?.user?.email) {
      axios.get(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`)
        .then((res) => {
          setCurrentUser(res.data.user);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [session]);

  // Function to convert YouTube URL to embeddable format
  const getEmbeddableUrl = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // If already embeddable or unknown format, return as is
    return url;
  };

  // Create theater-style seating layout
  const createTheaterSeating = (seatMap) => {
    // If no seatMap exists, generate a default one
    if (!seatMap || !Array.isArray(seatMap) || seatMap.length === 0) {
      // Import and use the default seat map generator
      const generateDefaultSeatMap = () => {
        const seatMap = [];
        const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        
        rowLabels.forEach((rowLabel, rowIndex) => {
          const row = [];
          let seatsInRow = 15; // 15 seats per row for default
          
          for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
            let seatType = 'regular';
            let price = 180;
            
            // Premium seats (first 2 rows)
            if (rowIndex < 2) {
              seatType = 'premium';
              price = 250;
            }
            // Economy seats (last 3 rows)
            else if (rowIndex >= 7) {
              seatType = 'economy';
              price = 120;
            }
            
            row.push({
              id: `${rowLabel}${seatNum}`,
              row: rowLabel,
              number: seatNum,
              type: seatType,
              price: price,
              available: true,
              bookedBy: null,
              gender: null
            });
          }
          seatMap.push(row);
        });
        
        return seatMap;
      };
      
      seatMap = generateDefaultSeatMap();
    }
    
    // Group seats by row from 2D seatMap array
    const seatsByRow = {};
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    
    seatMap.forEach((row, rowIndex) => {
      const rowLabel = rowLabels[rowIndex] || String.fromCharCode(65 + rowIndex);
      seatsByRow[rowLabel] = row
        .filter(seat => seat !== null) // Filter out null seats (aisles)
        .map((seat) => ({
          ...seat,
          seatNumber: seat.id || `${rowLabel}${seat.number || seat.seatIndex}`, // Use existing id or original number
          row: rowLabel
        }));
    });
    
    const sortedRows = Object.keys(seatsByRow).sort();
    
    return { seatsByRow, sortedRows };
  };

  const handleSeatSelect = (seatNumber, isBooked) => {
    if (isBooked) return;
    
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) 
        ? prev.filter((s) => s !== seatNumber) 
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (!session) {
      alert("Please login to book tickets");
      return;
    }
    
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    try {
      const bookingResponse = await axios.post(`/api/shows/${showId}/book`, { 
        seatNumbers: selectedSeats,
        showtime: selectedShowtime 
      });
      
      // Clear selected seats
      setSelectedSeats([]);
      
      // Refresh show data to get updated seat map
      const updatedShowResponse = await axios.get(`/api/shows/${showId}`);
      
      // Add a timestamp to force React re-render
      const updatedShow = {
        ...updatedShowResponse.data,
        lastUpdate: Date.now()
      };
      setShow(updatedShow);
      
      alert(`Successfully booked ${selectedSeats.length} seat(s): ${selectedSeats.join(", ")}`);
    } catch (error) {
      console.error("Booking error:", error.response?.data);
      alert("Booking failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading show details...</p>
        </div>
      </div>
    );
  }

  const { seatsByRow, sortedRows } = createTheaterSeating(show.seatMap);
  const totalSeats = show.totalSeats || (show.seatMap ? show.seatMap.flat().length : 150);
  const availableSeats = show.seatMap ? show.seatMap.flat().filter(s => s && s.available).length : 150;
  const selectedCount = selectedSeats.length;
  
  // Calculate total price based on selected seats
  const calculateTotalPrice = () => {
    let total = 0;
    selectedSeats.forEach(seatNumber => {
      const row = seatNumber.charAt(0);
      const seat = seatsByRow[row]?.find(s => s.seatNumber === seatNumber);
      if (seat) {
        total += seat.price || 180; // Default price if not found
      }
    });
    return total;
  };
  
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Movie Details Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Movie Poster */}
            <div className="lg:col-span-3">
              <div className="relative group">
                {show.posterUrl ? (
                  <div className="aspect-[2/3] relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src={show.posterUrl}
                      alt={show.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 300px"
                      priority={false}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-700 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-gray-400 text-lg">No Poster</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-yellow-400 text-sm font-medium">In Cinemas</span>
                </div>
              </div>
            </div>

            {/* Movie Information */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{show.title}</h1>
                
                {/* Movie Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                  <span className="bg-gray-800 px-3 py-1 rounded-lg text-sm">2D</span>
                  <span className="bg-gray-800 px-3 py-1 rounded-lg text-sm">Hindi</span>
                  <span>{show.duration || '2h 37m'}</span>
                  <span>•</span>
                  <span>{show.genre || 'Comedy, Drama'}</span>
                  <span>•</span>
                  <span>UA 16+</span>
                  <span>•</span>
                  <span>19 Sep, 2025</span>
                </div>

                {/* Book Tickets Button */}
                <button
                  onClick={() => document.getElementById('showtimes').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Book tickets
                </button>
              </div>
            </div>

            {/* Additional Movie Poster/Info */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Movie Info</h3>
                <div className="space-y-3 text-sm">
                  {show.genre && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Genre:</span>
                      <span className="text-white">{show.genre}</span>
                    </div>
                  )}
                  {show.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{show.duration} min</span>
                    </div>
                  )}
                  {show.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-white">{show.rating}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white">Hindi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white">2D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About the Movie */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {show.description && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About the movie</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
              {show.description}
            </p>
          </div>
        )}

        {/* Showtime Selection */}
        {show.showtimes && show.showtimes.length > 0 && (
          <div id="showtimes" className="mb-8">
            <div className="bg-gray-800/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-white">Choose Your Showtime</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {show.showtimes.map((time, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedShowtime(time)}
                    className={`p-4 rounded-xl font-medium transition-all duration-200 border-2 ${
                      selectedShowtime === time
                        ? "bg-pink-500 border-pink-400 text-white shadow-lg scale-105"
                        : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {new Date(time).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm opacity-80">
                        {new Date(time).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedShowtime && (
                <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-pink-400 font-medium">
                      Selected: {new Date(selectedShowtime).toLocaleString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seat Map - Only show when showtime is selected */}
        {selectedShowtime && (
          <div className="mb-8">
            {/* Theater Layout */}
            <div className="mb-8">
              {/* Screen */}
              <div className="text-center mb-8">
                <div className="relative">
                  <div className="h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mx-auto max-w-md opacity-70"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-800 via-yellow-300 to-gray-800 rounded-lg mx-auto max-w-lg mt-1 opacity-90"></div>
                  <p className="text-yellow-400 text-sm mt-3 font-medium">SCREEN</p>
                </div>
              </div>

              {/* Seating Area */}
              <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700" key={`seats-${show.lastUpdate || show.updatedAt || Date.now()}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-yellow-400">Select Your Seats</h3>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Premium (₹250)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Regular (₹180)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Economy (₹120)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span>Selected</span>
                    </div>
                    {currentUser?.gender === "female" && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-pink-500 rounded"></div>
                        <span>Female Booked</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span>Booked</span>
                    </div>
                  </div>
                </div>

                {/* Seat Map */}
                <div className="space-y-3">
                  {sortedRows.map((row, rowIndex) => (
                    <div key={row} className="flex items-center justify-center gap-2">
                      {/* Row Label */}
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded text-yellow-400 font-bold text-sm mr-2">
                        {row}
                      </div>
                      
                      {/* Left Section */}
                      <div className="flex gap-1">
                        {seatsByRow[row].slice(0, Math.ceil(seatsByRow[row].length / 3)).map((seat) => {
                          const isBooked = !seat.available;
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          
                          const getSeatColor = () => {
                            if (isBooked) {
                              // Pink seats: Show pink color for female-booked seats when viewed by female users
                              if (currentUser?.gender === "female" && seat.gender === "female") {
                                return "bg-pink-500 text-white cursor-not-allowed";
                              }
                              return "bg-gray-500 text-white cursor-not-allowed";
                            }
                            if (isSelected) return "bg-yellow-400 text-gray-900 scale-110 shadow-lg";
                            switch(seat.type) {
                              case 'premium': return "bg-purple-500 text-white hover:bg-purple-400 hover:scale-105";
                              case 'economy': return "bg-blue-500 text-white hover:bg-blue-400 hover:scale-105";
                              default: return "bg-green-500 text-white hover:bg-green-400 hover:scale-105";
                            }
                          };
                          return (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(seat.seatNumber, isBooked)}
                              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${getSeatColor()}`}
                              disabled={isBooked}
                            >
                              {seat.seatNumber.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Center Aisle */}
                      <div className="w-6"></div>
                      
                      {/* Center Section */}
                      <div className="flex gap-1">
                        {seatsByRow[row].slice(Math.ceil(seatsByRow[row].length / 3), Math.ceil(2 * seatsByRow[row].length / 3)).map((seat) => {
                          const isBooked = !seat.available;
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          const getSeatColor = () => {
                            if (isBooked) {
                              // Pink seats: Show pink color for female-booked seats when viewed by female users
                              if (currentUser?.gender === "female" && seat.gender === "female") {
                                return "bg-pink-500 text-white cursor-not-allowed";
                              }
                              return "bg-gray-500 text-white cursor-not-allowed";
                            }
                            if (isSelected) return "bg-yellow-400 text-gray-900 scale-110 shadow-lg";
                            switch(seat.type) {
                              case 'premium': return "bg-purple-500 text-white hover:bg-purple-400 hover:scale-105";
                              case 'economy': return "bg-blue-500 text-white hover:bg-blue-400 hover:scale-105";
                              default: return "bg-green-500 text-white hover:bg-green-400 hover:scale-105";
                            }
                          };
                          return (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(seat.seatNumber, isBooked)}
                              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${getSeatColor()}`}
                              disabled={isBooked}
                            >
                              {seat.seatNumber.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Right Aisle */}
                      <div className="w-6"></div>
                      
                      {/* Right Section */}
                      <div className="flex gap-1">
                        {seatsByRow[row].slice(Math.ceil(2 * seatsByRow[row].length / 3)).map((seat) => {
                          const isBooked = !seat.available;
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          const getSeatColor = () => {
                            if (isBooked) {
                              // Pink seats: Show pink color for female-booked seats when viewed by female users
                              if (currentUser?.gender === "female" && seat.gender === "female") {
                                return "bg-pink-500 text-white cursor-not-allowed";
                              }
                              return "bg-gray-500 text-white cursor-not-allowed";
                            }
                            if (isSelected) return "bg-yellow-400 text-gray-900 scale-110 shadow-lg";
                            switch(seat.type) {
                              case 'premium': return "bg-purple-500 text-white hover:bg-purple-400 hover:scale-105";
                              case 'economy': return "bg-blue-500 text-white hover:bg-blue-400 hover:scale-105";
                              default: return "bg-green-500 text-white hover:bg-green-400 hover:scale-105";
                            }
                          };
                          return (
                            <button
                              key={seat.seatNumber}
                              onClick={() => handleSeatSelect(seat.seatNumber, isBooked)}
                              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${getSeatColor()}`}
                              disabled={isBooked}
                            >
                              {seat.seatNumber.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Row Label (Right) */}
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded text-yellow-400 font-bold text-sm ml-2">
                        {row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Selected Seats: {selectedCount > 0 ? selectedSeats.join(", ") : "None"}</p>
                    {selectedCount > 0 && (
                      <div className="text-sm">
                        {selectedSeats.map(seatNumber => {
                          const row = seatNumber.charAt(0);
                          const seat = seatsByRow[row]?.find(s => s.seatNumber === seatNumber);
                          return (
                            <div key={seatNumber} className="flex justify-between">
                              <span>{seatNumber} ({seat?.type?.charAt(0).toUpperCase() + seat?.type?.slice(1) || 'Regular'})</span>
                              <span>₹{seat?.price || 180}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-white font-semibold">Total: ₹{totalPrice}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-400">
                    {availableSeats} of {totalSeats} seats available
                  </div>
                  {selectedSeats.length > 0 && (
                    <button
                      onClick={handleBooking}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Book {selectedCount} Seat{selectedCount !== 1 ? 's' : ''} - ₹{totalPrice}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movie Details */}
        {(show.trailerUrl || show.genre || show.duration) && (
          <div className="mt-8 bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Movie Details</h3>
            
            {show.trailerUrl && (
              <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  src={getEmbeddableUrl(show.trailerUrl)}
                  title={`${show.title} Trailer`}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
              {show.genre && (
                <div>
                  <span className="text-yellow-400 font-medium">Genre:</span>
                  <p>{show.genre}</p>
                </div>
              )}
              {show.duration && (
                <div>
                  <span className="text-yellow-400 font-medium">Duration:</span>
                  <p>{show.duration} minutes</p>
                </div>
              )}
              {show.rating && (
                <div>
                  <span className="text-yellow-400 font-medium">Rating:</span>
                  <p>{show.rating}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
