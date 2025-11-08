// ConnectDb.js
import mongoose from 'mongoose';
// import 'dotenv/config';

import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: envFile });

const uri = process.env.MONGODB_URL;
console.log('uri:', uri);
// const uri = process.env.MONGODB_URL || "mongodb+srv://temu1554:jAUFpYZ8EpbohZkj@capital.1jysv.mongodb.net/?retryWrites=true&w=majority&appName=Capital";

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      // Mongoose 6+ automatically uses the new URL parser and unified topology,
      // so these options are no longer needed:
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    console.log('✅ Successfully connected to MongoDB via Mongoose');
    console.log('✅ Connected to DB:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
  // Do not close the connection here; keep it open for your app's lifetime.
}

export default connectDB;
