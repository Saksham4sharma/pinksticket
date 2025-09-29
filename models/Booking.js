import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  show: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
  seats: [String]
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
