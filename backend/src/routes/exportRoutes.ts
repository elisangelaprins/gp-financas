import { Router } from 'express';
import { verifyUser } from '../middlewares/authMiddleware.js';
import { exportCSV } from '../controllers/exportController.js';

const router = Router();

router.use(verifyUser);

router.get('/csv', exportCSV);

export default router;