import Link from "next/link";
import Image from "next/image";

export default function ShowCard({ show }) {
  const availableSeats = show.seatMap 
    ? show.seatMap.flat().filter(seat => seat && seat.available).length
    : show.totalSeats || 0;

  const now = new Date();
  const upcoming = Array.isArray(show.showtimes)
    ? show.showtimes
        .map((d) => new Date(d))
        .filter((d) => !isNaN(d) && d >= now)
        .sort((a, b) => a - b)
    : [];
  const nextShow = upcoming[0];

  const formatShowtime = (d) =>
    d?.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Link href={`/shows/${show._id}`}>
      <div className="group cursor-pointer">
        {/* Movie poster */}
        <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg border-2 border-gray-800 shadow-2xl transition-all duration-300 group-hover:border-yellow-400 group-hover:scale-105 group-hover:shadow-yellow-400/20">
          {show.posterUrl ? (
            <Image
              src={show.posterUrl}
              alt={show.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={false}
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v16a1 1 0 001 1h8a1 1 0 001-1V4" />
                </svg>
                <span className="text-sm text-gray-500">NO POSTER</span>
              </div>
            </div>
          )}
          
          {/* Film grain overlay */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
          
          {/* Status ribbon */}
          <div className="absolute top-3 -right-2">
            <div className={`px-3 py-1 text-xs font-bold transform rotate-12 shadow-lg ${
              availableSeats > 0 
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white" 
                : "bg-gradient-to-r from-red-600 to-red-700 text-white"
            }`}>
              {availableSeats > 0 ? "AVAILABLE" : "SOLD OUT"}
            </div>
          </div>

          {/* Vintage film corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-yellow-400/50"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-400/50"></div>
        </div>

        {/* Movie info */}
        <div className="space-y-3">
          <h3 className="font-black text-white text-base md:text-lg leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors">
            {show.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {nextShow ? formatShowtime(nextShow).split(',')[0] : "TBA"}
            </span>
            <span className="text-yellow-400 font-bold">
              {availableSeats} seats
            </span>
          </div>
          
          {/* Ticket stub style button */}
          <div className="mt-4 relative">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-3 px-4 text-sm font-bold tracking-wider border-l-4 border-r-4 border-dashed border-red-400 transition-all group-hover:from-yellow-500 group-hover:to-yellow-600 group-hover:text-black">
              BOOK TICKET
            </div>
            {/* Ticket perforations */}
            <div className="absolute -left-1 top-1/2 w-2 h-2 bg-black rounded-full transform -translate-y-1/2"></div>
            <div className="absolute -right-1 top-1/2 w-2 h-2 bg-black rounded-full transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
