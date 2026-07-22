import { Router } from 'express';
import { verifyUser } from '../middlewares/authMiddleware.js';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../controllers/transactionController.js';


const router = Router();

router.use(verifyUser);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;