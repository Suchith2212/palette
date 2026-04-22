import { Router } from 'express';
import { getHomeStats, updateHomeStats } from '../controllers/homeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', getHomeStats);
router.put('/stats', protect, authorize('admin'), updateHomeStats);

export default router;
