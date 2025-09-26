import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { questionsController } from '../controllers/questionsController';

const router = Router();

router.get('/', questionsController.list);
router.post('/', authRequired, questionsController.add);
router.post('/:id/upvote', authRequired, questionsController.upvote);
router.post('/:id/downvote', authRequired, questionsController.downvote);
router.post('/:id/bookmark', authRequired, questionsController.bookmark);

export default router;
