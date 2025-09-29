import mongoose from "mongoose";

const Connection = {};

async function connectToDB() {
  if (Connection.isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");
    Connection.isConnected = mongoose.connection.readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export default connectToDB;
