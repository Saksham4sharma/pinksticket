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
    return NextResponse.json(show);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch show" }, { status: 500 });
  }
}

export async function PUT(req, ctx) {
  try {
    await connectToDB();
    const { id } = await ctx.params;
    const body = await req.json();
    
    const updatedShow = await Show.findByIdAndUpdate(id, body, { new: true });
    if (!updatedShow) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedShow);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update show" }, { status: 500 });
  }
}

export async function DELETE(req, ctx) {
  try {
    await connectToDB();
    const { id } = await ctx.params;
    
    const deletedShow = await Show.findByIdAndDelete(id);
    if (!deletedShow) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Show deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete show" }, { status: 500 });
  }
}
