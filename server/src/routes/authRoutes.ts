import { Router } from 'express';
import { registerUser, loginUser, getMe, updateUserProfile, verifyUserCode } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-code', verifyUserCode); // New route for numeric code verification
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Protected route to get user profile
router.put('/profile', protect, updateUserProfile); // Protected route to update user profile

export default router;
