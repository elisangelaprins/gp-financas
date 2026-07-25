import { Router } from "express";
import { verifyUser } from "../middlewares/authMiddleware.js";
import { createBudget, getBudget, updateBudget, deleteBudget } from "../controllers/budgetController.js";

const router = Router();

router.use(verifyUser);

router.post('/', createBudget);
router.get('/', getBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget)

export default router;

