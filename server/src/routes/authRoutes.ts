import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { authController } from '../controllers/authController.js';

const router = Router();
router.get('/health', (_req, res) => {
  res.json({ message: "true" });
}); 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authRequired, authController.getMe);

export default router;
