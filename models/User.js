import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: { type: String, enum: ["male", "female", "other"], default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
