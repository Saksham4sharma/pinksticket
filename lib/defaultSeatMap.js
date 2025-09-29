export const generateDefaultSeatMap = () => {
  const seatMap = [];
  let seatNumber = 1;
  
  // Premium seats (2 rows, 10 seats each) - Row A, B
  for (let row = 0; row < 2; row++) {
    const rowSeats = [];
    const rowLabel = String.fromCharCode(65 + row); // A, B
    
    for (let seat = 0; seat < 10; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'premium',
        available: true,
        price: 250
      });
      seatNumber++;
    }
    seatMap.push(rowSeats);
  }
  
  // Regular seats (8 rows, 12 seats each with aisle) - Row C to J
  for (let row = 2; row < 10; row++) {
    const rowSeats = [];
    const rowLabel = String.fromCharCode(65 + row); // C, D, E, F, G, H, I, J
    
    // Left section (4 seats)
    for (let seat = 0; seat < 4; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'regular',
        available: true,
        price: 180
      });
      seatNumber++;
    }
    
    // Aisle space
    rowSeats.push(null);
    
    // Middle section (4 seats)
    for (let seat = 4; seat < 8; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'regular',
        available: true,
        price: 180
      });
      seatNumber++;
    }
    
    // Aisle space
    rowSeats.push(null);
    
    // Right section (4 seats)
    for (let seat = 8; seat < 12; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'regular',
        available: true,
        price: 180
      });
      seatNumber++;
    }
    
    seatMap.push(rowSeats);
  }
  
  // Economy seats (3 rows, 14 seats each with aisle) - Row K, L, M
  for (let row = 10; row < 13; row++) {
    const rowSeats = [];
    const rowLabel = String.fromCharCode(65 + row); // K, L, M
    
    // Left section (5 seats)
    for (let seat = 0; seat < 5; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'economy',
        available: true,
        price: 120
      });
      seatNumber++;
    }
    
    // Aisle space
    rowSeats.push(null);
    
    // Middle section (4 seats)
    for (let seat = 5; seat < 9; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'economy',
        available: true,
        price: 120
      });
      seatNumber++;
    }
    
    // Aisle space
    rowSeats.push(null);
    
    // Right section (5 seats)
    for (let seat = 9; seat < 14; seat++) {
      rowSeats.push({
        id: `${rowLabel}${seat + 1}`,
        row: rowLabel,
        number: seat + 1,
        type: 'economy',
        available: true,
        price: 120
      });
      seatNumber++;
    }
    
    seatMap.push(rowSeats);
  }
  
  return seatMap;
};

export const getSeatTypeColor = (type, available = true, selected = false) => {
  if (selected) return 'bg-pink-500 border-pink-400';
  if (!available) return 'bg-red-500 border-red-400 cursor-not-allowed';
  
  switch (type) {
    case 'premium':
      return 'bg-yellow-500 border-yellow-400 hover:bg-yellow-400';
    case 'regular':
      return 'bg-blue-500 border-blue-400 hover:bg-blue-400';
    case 'economy':
      return 'bg-green-500 border-green-400 hover:bg-green-400';
    default:
      return 'bg-gray-500 border-gray-400 hover:bg-gray-400';
  }
};

export const getSeatTypeLabel = (type) => {
  switch (type) {
    case 'premium':
      return 'Premium';
    case 'regular':
      return 'Regular';
    case 'economy':
      return 'Economy';
    default:
      return 'Standard';
  }
};