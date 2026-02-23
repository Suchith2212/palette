import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Exhibition from '../models/Exhibition';
import path from 'path';
import { promises as fs } from 'fs';

export const getExhibitionItems = asyncHandler(async (req: Request, res: Response) => {
  const exhibitions = await Exhibition.find({}).sort('-createdAt');
  res.json(exhibitions);
});

export const createExhibitionItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const { title, description, date, time, venue, credits } = req.body;
  const imageUrl = `/uploads/exhibition/${req.file.filename}`;
  console.log('Generated imageUrl for database (exhibition):', imageUrl);
  console.log('Expected server upload path for file (exhibition):', path.join(__dirname, '../../uploads/exhibition', req.file.filename));

  const exhibition = new Exhibition({
    title,
    description,
    date,
    time,
    venue,
    credits,
    imageUrl,
  });

  const createdExhibition = await exhibition.save();
  res.status(201).json(createdExhibition);
});

export const updateExhibitionItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }

  const { id } = req.params;
  const { title, description, date, time, venue, credits } = req.body;

  const exhibition = await Exhibition.findById(id);

  if (!exhibition) {
    res.status(404);
    throw new Error('Exhibition item not found');
  }

  // If a new image is uploaded, delete the old one
  if (req.file && exhibition.imageUrl) {
    const oldImagePath = path.join(__dirname, '../../uploads/exhibition', path.basename(exhibition.imageUrl));
    try {
      await fs.unlink(oldImagePath);
      console.log(`Deleted old exhibition image: ${oldImagePath}`);
    } catch (err) {
      console.error(`Failed to delete old exhibition image: ${oldImagePath}`, err);
    }
    exhibition.imageUrl = `/uploads/exhibition/${req.file.filename}`;
  }

  exhibition.title = title || exhibition.title;
  exhibition.description = description || exhibition.description;
  exhibition.date = date || exhibition.date;
  exhibition.time = time || exhibition.time;
  exhibition.venue = venue || exhibition.venue;
  exhibition.credits = credits || exhibition.credits;

  const updatedExhibition = await exhibition.save();
  res.json(updatedExhibition);
});

export const getExhibitionItemById = asyncHandler(async (req: Request, res: Response) => {
  const exhibition = await Exhibition.findById(req.params.id);

  if (exhibition) {
    res.json(exhibition);
  } else {
    res.status(404);
    throw new Error('Exhibition item not found');
  }
});

export const deleteExhibitionItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }

  const { id } = req.params;
  const exhibition = await Exhibition.findById(id);

  if (!exhibition) {
    res.status(404);
    throw new Error('Exhibition item not found');
  }

  // Delete the image file from the uploads directory
  if (exhibition.imageUrl) {
    const imagePath = path.join(__dirname, '../../uploads/exhibition', path.basename(exhibition.imageUrl));
    try {
      await fs.unlink(imagePath);
      console.log(`Deleted exhibition image: ${imagePath}`);
    } catch (err: any) {
      console.error(`Failed to delete exhibition image: ${imagePath}`, err);
      // Log the error but proceed with deleting the DB record.
    }
  }

  await exhibition.deleteOne();
  res.json({ message: 'Exhibition item removed successfully' });
});
