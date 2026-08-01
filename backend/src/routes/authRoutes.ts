import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.js';
import { verifyUser } from '../middlewares/authMiddleware.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/verify', verifyUser, (req, res) => {
    const tokenHeader = req as AuthRequest;

    res.json({
        message: "Usuário verificado com sucesso",
        user: tokenHeader.user
    });
});

export default router;