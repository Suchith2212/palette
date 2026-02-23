
import { getUpcomingWorkshops, getUpcomingCompetitions, createEvent, getPastEvents, applyToEvent, getEventById, updateEvent, deleteEvent, getUpcomingEvents } from '../controllers/eventController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../config/multerConfig'; // Import multer instance
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';  


const router = Router();

// Public routes for fetching events
router.get('/workshops', getUpcomingWorkshops);
router.get('/competitions', getUpcomingCompetitions);
router.get('/upcoming', getUpcomingEvents); // New route for all upcoming events
router.get('/past', getPastEvents);

// Private/Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'), // Reverted to upload.single('image')
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer Error:', err.message);
      return res.status(400).json({ message: err.message, type: 'MulterError' });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown upload error:', err.message);
      return res.status(500).json({ message: err.message, type: 'UnknownError' });
    }
    next(); // Continue to the createEvent controller
  },
  createEvent
);
router.put('/:id', protect, authorize('admin'), updateEvent); // Admin-only route to update an event
router.delete('/:id', protect, authorize('admin'), deleteEvent); // Admin-only route to delete an event

// User-specific routes
router.post('/:id/apply', protect, applyToEvent);

// General route for fetching a single event by ID - should be last among GETs
router.get('/:id', getEventById);

export default router;