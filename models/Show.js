import mongoose from "mongoose";

const SeatSub = new mongoose.Schema({
  id: String,
  row: String,
  number: Number,
  type: { type: String, enum: ["premium", "regular", "economy"], default: "regular" },
  price: { type: Number, default: 180 },
  available: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  gender: { type: String, enum: ["male", "female", "other"], default: null }
}, { _id: false });

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  posterUrl: { type: String, default: "" },
  trailerUrl: { type: String, default: "" }, // should be embed URL for iframe
  showtimes: [{ type: Date }],
  seatMapType: { type: String, enum: ["default", "custom"], default: "default" },
  seatMap: [[SeatSub]], // 2D array representing the theater layout
  totalSeats: { type: Number, default: 150 }
}, { timestamps: true });

export default mongoose.models.Show || mongoose.model("Show", showSchema);
