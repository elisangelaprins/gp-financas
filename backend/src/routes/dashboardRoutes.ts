import { Router } from "express";
import { verifyUser } from "../middlewares/authMiddleware.js";
import { getByCategory, getSummary, getTopExpenses } from "../controllers/dashboardController.js";

const router = Router();
router.use(verifyUser);

router.get("/summary", getSummary);
router.get("/by-category", getByCategory);
router.get("/top-expenses", getTopExpenses);

export default router;