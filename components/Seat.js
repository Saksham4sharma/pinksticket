export default function Seat({ seat, currentUserGender, onSelect }) {
  let seatClass = "bg-gray-200"; // default (available)

  if (seat.bookedBy) {
    if (currentUserGender === "female" && seat.gender === "female") {
      seatClass = "bg-pink-400"; // pink for female viewer
    } else {
      seatClass = "bg-red-500"; // generic booked color
    }
  }

  return (
    <div
      onClick={() => !seat.bookedBy && onSelect(seat.seatNumber)}
      className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${seatClass}`}
    >
      {seat.seatNumber}
    </div>
  );
}
