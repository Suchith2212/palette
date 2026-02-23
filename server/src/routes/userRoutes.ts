import { Router } from 'express';
import { getUserProfile, updateUserProfile, getMyArtwork, getMyEvents } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/my-artwork', protect, getMyArtwork);
router.get('/my-events', protect, getMyEvents);

export default router;
