import { Router } from 'express';
import { verifyUser } from '../middlewares/authMiddleware.js';
import { exportCSV, exportPDF } from '../controllers/exportController.js';

const router = Router();

router.use(verifyUser);

router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

export default router;