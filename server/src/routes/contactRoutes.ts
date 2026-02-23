import { Router } from 'express';
import { submitContactForm, getContactSubmissions, deleteContactSubmission } from '../controllers/contactController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, authorize('admin'), getContactSubmissions)
  .post(submitContactForm);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteContactSubmission);

export default router;
