import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { authController } from '../controllers/authController';

const router = Router();
router.get('/health', (_req, res) => {
  res.json({ message: "true" });
}); 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authRequired, authController.getMe);

export default router;
