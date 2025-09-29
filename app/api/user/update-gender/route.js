import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { email, gender } = await request.json();

    if (!email || !gender) {
      return NextResponse.json(
        { error: "Email and gender are required" },
        { status: 400 }
      );
    }

    if (!["male", "female", "other"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.findOneAndUpdate(
      { email },
      { gender },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Gender updated successfully",
      user: { email: user.email, gender: user.gender }
    });

  } catch (error) {
    console.error("Error updating user gender:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}