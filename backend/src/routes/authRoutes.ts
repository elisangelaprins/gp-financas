import { Router } from 'express';
import { register } from '../controllers/authController.js';
import { login } from '../controllers/authController.js';
import { verifyUser } from '../middlewares/authMiddleware.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/verify', verifyUser, (req, res) => {
    const tokenHeader = req as AuthRequest;

    res.json({
        message: "Usuário verificado com sucesso",
        user: tokenHeader.user
    });
});
export default router;

//# sourceMappingURL=authRoutes.js.map