import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Exhibition from './models/Exhibition';
import { readFileSync } from 'fs';
import path from 'path';

dotenv.config();
connectDB();

const importExhibitionData = async () => {
  try {
    // Clear existing exhibition data
    await Exhibition.deleteMany();
    console.log('Exhibition data cleared!');

    const exhibJsonPath = path.join(__dirname, '..', '..', 'client', 'src', 'components', 'exhibition_items.json');
    const rawData = readFileSync(exhibJsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data || !Array.isArray(data.events)) {
      throw new Error('exhib.json is not in expected format (missing events array).');
    }

    // Add imageUrl to each item, assuming a pattern or using a placeholder
    const exhibitionItemsWithImages = data.events.map((item: any, index: number) => ({
      ...item,
      // Placeholder image URL - adjust if you have actual image files to map
      imageUrl: `/uploads/exhibition/ex_${index + 1}.jpeg`,
    }));

    await Exhibition.insertMany(exhibitionItemsWithImages);
    console.log('Exhibition data imported!');
    process.exit();
  } catch (error) {
    console.error(`Error importing exhibition data: ${error}`);
    process.exit(1);
  }
};

importExhibitionData();
