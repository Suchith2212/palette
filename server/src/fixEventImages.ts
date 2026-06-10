import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { readFileSync } from 'fs';
import Event from './models/Event';
import { resolveEventImagePath } from './utils/eventImageUrl';

dotenv.config();

type JsonEvent = { Title?: string; title?: string };

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim() || 'mongodb://127.0.0.1:27017/palette';
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

const loadTitles = (relativePath: string): string[] => {
  const filePath = path.join(__dirname, '..', '..', 'client', 'src', 'components', relativePath);
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as { events: JsonEvent[] };
  return data.events.map((event) => (event.Title || event.title || '').trim()).filter(Boolean);
};

const fixEventImages = async () => {
  await connectDB();

  const pastTitles = loadTitles('past_events.json');
  const currentTitles = loadTitles('present_events.json');
  const mappings = [
    ...pastTitles.map((title, index) => ({ title, imageNumber: index + 1 })),
    ...currentTitles.map((title, index) => ({ title, imageNumber: index + 23 })),
  ];

  let updated = 0;
  let missing = 0;

  for (const { title, imageNumber } of mappings) {
    const imageUrl = resolveEventImagePath(imageNumber);
    const result = await Event.updateMany({ title }, { $set: { imageUrl } });
    if (result.matchedCount === 0) {
      console.warn(`No DB event matched title: "${title}" → ${imageUrl}`);
      missing += 1;
    } else {
      console.log(`Updated "${title}" → ${imageUrl} (${result.modifiedCount} doc(s))`);
      updated += result.modifiedCount;
    }
  }

  console.log(`\nDone. Updated ${updated} event(s). ${missing} title(s) not found in DB.`);
  console.log('If events are missing, run: npm run data:import && npm run data:seedCurrent');
  process.exit(0);
};

fixEventImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
