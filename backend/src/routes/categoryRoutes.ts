import { Router } from 'express';
import { verifyUser } from '../middlewares/authMiddleware.js';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../controllers/categoryController.js';

const router = Router();

router.use(verifyUser);

router.post('/', createCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;