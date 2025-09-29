import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Show from "@/models/Show";
import User from "@/models/User";
import { getServerSession } from "next-auth";
// Note: this file is at app/api/shows/[id]/book/route.js
// We need to go up three levels to reach app/api, then into auth/[...nextauth]/route
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req, ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const { seatNumbers } = await req.json();
    const { id } = await ctx.params;

    // Find the show
    const show = await Show.findById(id);
    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    // Check if seatMap exists, if not generate a default one
    if (!show.seatMap || !Array.isArray(show.seatMap) || show.seatMap.length === 0) {
      // We need to import and use the default seat map generator
      const { generateDefaultSeatMap } = await import("@/lib/defaultSeatMap");
      show.seatMap = generateDefaultSeatMap();
      await show.save();
    }

    // Check if all requested seats are available and book them
    let bookedSeats = 0;
    const updatedSeatMap = show.seatMap.map(row => 
      row.map(seat => {
        // Skip null seats (aisles)
        if (!seat) return seat;
        
        // Use the seat's id property for matching (this should match seatNumber from frontend)
        const seatId = seat.id;
        if (seatNumbers.includes(seatId)) {
          if (seat.available) {
            bookedSeats++;
            return {
              ...seat,
              available: false,
              bookedBy: user._id,
              gender: user.gender
            };
          }
        }
        return seat;
      })
    );

    // Check if all seats were successfully booked
    if (bookedSeats !== seatNumbers.length) {
      return NextResponse.json({ error: "Some seats already booked" }, { status: 400 });
    }

    // Update the show with the new seat map
    show.seatMap = updatedSeatMap;
    await show.save();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully booked ${bookedSeats} seats`
    });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
