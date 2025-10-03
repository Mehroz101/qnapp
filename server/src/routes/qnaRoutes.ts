import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { authOptional } from '../middleware/Optionalauth.js';
import { qnaController } from '../controllers/qnaController.js';

const router = Router();

router.post('/', authRequired, qnaController.createQuestion);
router.get('/', authOptional, qnaController.listQuestions);
router.get('/categories', qnaController.getCategories);
router.get('/:id', authOptional, qnaController.getQuestionDetail);
router.put('/:id', authRequired, qnaController.updateQuestion);
router.delete('/:id', authRequired, qnaController.deleteQuestion);
router.post('/view', qnaController.viewQuestion);
router.post('/:id/answers', authRequired, qnaController.answerQuestion);
router.post('/:id/upvote', authRequired, qnaController.upvote);
router.post('/:id/downvote', authRequired, qnaController.downvote);
router.post('/:id/bookmark', authRequired, qnaController.bookmark);
router.get('/me/questions', authRequired, qnaController.myQuestions);
router.get('/me/upvoted', authRequired, qnaController.myUpvoted);
router.get('/me/downvoted', authRequired, qnaController.myDownvoted);
router.get('/me/bookmarks', authRequired, qnaController.myBookmarks);
router.post('/generate', authRequired, qnaController.generateWithAI);

export default router;
