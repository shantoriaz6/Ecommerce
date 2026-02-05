import serverless from "serverless-http";
import mongoose from "mongoose";
import { app } from "../src/app.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  await connectDB();
  return serverless(app)(req, res);
}
