import { Router, Request } from 'express';
import {
  uploadArtwork,
  getAllArtworks,
  getArtworkById,
  updateArtworkStatus,
  addArtworkScore,
  deleteArtwork,
  getMyArtworks
} from '../controllers/artworkController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../config/multerConfig'; // Import the configured multer upload middleware

// Extend the Request type to include a file property
declare module 'express' {
  interface Request {
    file?: Express.Multer.File;
  }
}

const router = Router();

router.post('/', protect, upload.single('image'), uploadArtwork); // User uploads artwork, 'image' is the field name for the file
router.get('/my-artworks', protect, getMyArtworks); // Get artworks by current user
router.get('/', getAllArtworks); // Get all artworks (publicly visible by default, admin can filter)
router.get('/:id', protect, getArtworkById); // Get single artwork (publicly visible if approved, private if by artist/admin)
router.put('/:id/status', protect, authorize('admin'), updateArtworkStatus); // Admin updates status
router.put('/:id/score', protect, authorize('admin'), addArtworkScore); // Admin adds/updates score
router.delete('/:id', protect, deleteArtwork); // Admin or artist (if pending) deletes artwork

export default router;