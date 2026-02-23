import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artwork from './models/Artwork';
import User from './models/User';
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

const importArtworks = async () => {
  await connectDB();

  try {
    // Clear existing artworks before importing
    await Artwork.deleteMany();
    console.log('Existing artworks cleared.');

    // Find an admin user to assign as 'artist'
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const sampleArtworks = [
      {
        title: 'Abstract Flow',
        description: 'A vibrant abstract piece exploring movement and color.',
        credits: 'Artist X',
        imageUrl: '/uploads/exhibition/ex_1.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'City at Dusk',
        description: 'A serene cityscape bathed in the warm hues of twilight.',
        credits: 'Jane Doe',
        imageUrl: '/uploads/exhibition/ex_2.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Forest Whisper',
        description: 'Deep forest with subtle light filtering through leaves.',
        credits: 'John Smith',
        imageUrl: '/uploads/exhibition/ex_3.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Ocean\'s Embrace',
        description: 'Waves crashing on a rocky shore under a stormy sky.',
        credits: 'Emily White',
        imageUrl: '/uploads/exhibition/ex_4.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Mountain Majesty',
        description: 'Towering peaks reaching for the clouds, covered in snow.',
        credits: 'David Green',
        imageUrl: '/uploads/exhibition/ex_5.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Desert Bloom',
        description: 'A rare flower blooming defiantly in arid lands.',
        credits: 'Sarah Blue',
        imageUrl: '/uploads/exhibition/ex_6.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Starlight Symphony',
        description: 'A cosmic dance of stars and nebulae.',
        credits: 'Michael Black',
        imageUrl: '/uploads/exhibition/ex_7.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
      {
        title: 'Geometric Harmony',
        description: 'Interlocking shapes creating a sense of balance.',
        credits: 'Laura Red',
        imageUrl: '/uploads/exhibition/ex_8.jpeg',
        artist: adminUser._id,
        status: 'approved',
      },
    ];

    await Artwork.insertMany(sampleArtworks);
    console.log('Sample Artworks Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importArtworks();
