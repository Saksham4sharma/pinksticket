"use client";
import React from 'react';
import { getSeatTypeColor, getSeatTypeLabel } from '@/lib/defaultSeatMap';

export default function SeatMapPreview({ seatMap, selectedSeats = [], onSeatSelect, interactive = false }) {
  const handleSeatClick = (seat) => {
    if (!interactive || !seat || !seat.available) return;
    
    if (onSeatSelect) {
      onSeatSelect(seat);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-full">
      {/* Screen */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-gray-600 to-gray-500 h-2 rounded-full mb-2 shadow-lg"></div>
        <p className="text-center text-gray-400 text-xs">SCREEN</p>
      </div>

      {/* Seat Map */}
      <div className="space-y-2 w-full overflow-x-auto">
        {seatMap.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center space-x-1 min-w-fit">
            {/* Row Label */}
            <div className="w-6 text-center text-gray-400 font-bold flex-shrink-0 text-xs">
              {row.find(seat => seat)?.row || ''}
            </div>
            
            {/* Seats */}
            <div className="flex space-x-1">
              {row.map((seat, seatIndex) => {
                if (!seat) {
                  // Aisle space
                  return <div key={seatIndex} className="w-3 flex-shrink-0"></div>;
                }

                const isSelected = selectedSeats.some(s => s.id === seat.id);
                const seatColor = getSeatTypeColor(seat.type, seat.available, isSelected);

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!seat.available || !interactive}
                    className={`
                      w-6 h-6 rounded border text-xs font-bold text-white
                      transition-all duration-200 flex items-center justify-center flex-shrink-0
                      ${seatColor}
                      ${interactive && seat.available ? 'cursor-pointer' : ''}
                      ${!seat.available ? 'opacity-50' : ''}
                    `}
                    title={`${seat.id} - ${getSeatTypeLabel(seat.type)} - ₹${seat.price}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 border border-yellow-400 rounded"></div>
          <span className="text-gray-300">Premium (₹250)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 border border-blue-400 rounded"></div>
          <span className="text-gray-300">Regular (₹180)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 border border-green-400 rounded"></div>
          <span className="text-gray-300">Economy (₹120)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 border border-red-400 rounded opacity-50"></div>
          <span className="text-gray-300">Unavailable</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-400">Total Seats</p>
            <p className="text-white font-bold">
              {seatMap.flat().filter(seat => seat !== null).length}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Available</p>
            <p className="text-green-400 font-bold">
              {seatMap.flat().filter(seat => seat && seat.available).length}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Occupied</p>
            <p className="text-red-400 font-bold">
              {seatMap.flat().filter(seat => seat && !seat.available).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}