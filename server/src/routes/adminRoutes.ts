import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getAdmins, getAdminActivity, getUsers, promoteUserToAdmin } from '../controllers/adminController';

const router = Router();

router.get('/admins', protect, authorize('admin'), getAdmins);
router.get('/activity', protect, authorize('admin'), getAdminActivity);
router.get('/users', protect, authorize('admin'), getUsers);
router.post('/promote', protect, authorize('admin'), promoteUserToAdmin);

export default router;
