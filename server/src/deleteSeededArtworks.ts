import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artwork from './models/Artwork';
import path from 'path';
import { promises as fs } from 'fs';

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

const deleteSeededArtworks = async () => {
  await connectDB();

  try {
    const seededImageUrls = [
      '/uploads/exhibition/ex_1.jpeg',
      '/uploads/exhibition/ex_2.jpeg',
      '/uploads/exhibition/ex_3.jpeg',
      '/uploads/exhibition/ex_4.jpeg',
      '/uploads/exhibition/ex_5.jpeg',
      '/uploads/exhibition/ex_6.jpeg',
      '/uploads/exhibition/ex_7.jpeg',
      '/uploads/exhibition/ex_8.jpeg',
    ];

    const deleteResult = await Artwork.deleteMany({ imageUrl: { $in: seededImageUrls } });
    console.log(`Deleted ${deleteResult.deletedCount} seeded artworks from the database.`);

    // Optionally, delete the actual image files from the uploads folder
    for (const imageUrl of seededImageUrls) {
      const filename = path.basename(imageUrl);
      const imageFilePath = path.join(__dirname, '..', '..', 'uploads', 'exhibition', filename);
      try {
        await fs.unlink(imageFilePath);
        console.log(`Deleted image file: ${imageFilePath}`);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.log(`Image file not found (already deleted or never existed): ${imageFilePath}`);
        } else {
          console.error(`Error deleting image file ${imageFilePath}: ${err.message}`);
        }
      }
    }

    process.exit();
  } catch (error) {
    console.error(`Error deleting seeded artworks: ${error}`);
    process.exit(1);
  }
};

deleteSeededArtworks();