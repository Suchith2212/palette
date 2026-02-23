import { Router } from 'express';
import { getExhibitionItems, createExhibitionItem, updateExhibitionItem, getExhibitionItemById, deleteExhibitionItem } from '../controllers/exhibitionController';
import { protect, authorize } from '../middleware/authMiddleware';
import uploadExhibition from '../config/multerExhibitionConfig';

const router = Router();

router.route('/')
  .get(getExhibitionItems)
  .post(protect, authorize('admin'), uploadExhibition.single('image'), createExhibitionItem);

router.route('/:id')
  .get(getExhibitionItemById)
  .put(protect, authorize('admin'), uploadExhibition.single('image'), updateExhibitionItem)
  .delete(protect, authorize('admin'), deleteExhibitionItem);

export default router;
