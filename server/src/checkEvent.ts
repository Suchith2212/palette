import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event';
import path from 'path';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/palette', {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const checkEvent = async () => {
  await connectDB();
  try {
    const event = await Event.findOne({ title: 'Cultural Quiz' });

    if (event) {
      console.log('--- Cultural Quiz Event Details ---');
      console.log(`Title: ${event.title}`);
      console.log(`Date: ${event.date ? event.date.toISOString() : 'N/A'}`);
      console.log(`EndDate: ${event.endDate ? event.endDate.toISOString() : 'N/A'}`);
      console.log(`Type: ${event.type}`);
      console.log(`Status: ${event.status}`);
    } else {
      console.log('Event "Cultural Quiz" not found in the database.');
    }

    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    console.log(`--- Server's perception of today (UTC 00:00:00) ---`);
    console.log(`startOfTodayUTC: ${startOfTodayUTC.toISOString()}`);
    console.log(`Current Server Time (UTC): ${now.toISOString()}`);


    process.exit(0);
  } catch (error) {
    console.error(`Error checking event: ${error}`);
    process.exit(1);
  }
};

checkEvent();
