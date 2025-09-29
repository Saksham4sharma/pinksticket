import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Show from "@/models/Show";

export async function GET() {
  try {
    await connectToDB();
    const shows = await Show.find();
    return NextResponse.json(shows);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch shows" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const newShow = new Show(body);
    await newShow.save();
    return NextResponse.json(newShow, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create show" }, { status: 500 });
  }
}
