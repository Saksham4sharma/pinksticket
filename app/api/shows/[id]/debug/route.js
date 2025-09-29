import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Show from "@/models/Show";

export async function GET(req, ctx) {
  try {
    await connectToDB();
    const { id } = await ctx.params;

    const show = await Show.findById(id);
    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    const seatStats = {
      totalSeats: 0,
      availableSeats: 0,
      bookedSeats: 0,
      seatDetails: []
    };

    if (show.seatMap && show.seatMap.length > 0) {
      show.seatMap.forEach(row => {
        row.forEach(seat => {
          if (seat) {
            seatStats.totalSeats++;
            if (seat.available) {
              seatStats.availableSeats++;
            } else {
              seatStats.bookedSeats++;
              seatStats.seatDetails.push({
                id: seat.id,
                bookedBy: seat.bookedBy,
                gender: seat.gender
              });
            }
          }
        });
      });
    }

    return NextResponse.json({
      showId: id,
      showTitle: show.title,
      seatStats,
      seatMapExists: !!show.seatMap,
      seatMapLength: show.seatMap?.length || 0
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}