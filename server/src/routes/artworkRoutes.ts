import { Router, Request } from 'express';
import {
  uploadArtwork,
  getAllArtworks,
  getArtworkById,
  updateArtworkStatus,
  addArtworkScore,
  updateArtworkOrder,
  updateArtworkDetails,
  deleteArtwork,
  getMyArtworks
} from '../controllers/artworkController';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware';
import artworkUpload from '../config/multerArtworkConfig';

// Extend the Request type to include a file property
declare module 'express' {
  interface Request {
    file?: Express.Multer.File;
  }
}

const router = Router();

router.post('/', protect, artworkUpload.single('image'), uploadArtwork);
router.get('/my-artworks', protect, getMyArtworks);
router.get('/admin/all', protect, authorize('admin'), getAllArtworks);
router.get('/', optionalProtect, getAllArtworks);
router.get('/:id', optionalProtect, getArtworkById);
router.put('/:id', protect, authorize('admin'), updateArtworkDetails); // Admin edits artwork details
router.put('/:id/status', protect, authorize('admin'), updateArtworkStatus); // Admin updates status
router.put('/:id/score', protect, authorize('admin'), addArtworkScore); // Admin adds/updates score
router.put('/:id/order', protect, authorize('admin'), updateArtworkOrder); // Admin updates display order
router.delete('/:id', protect, deleteArtwork); // Admin or artist (if pending) deletes artwork

export default router;
