// server/routes/comments.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as commentController from '../controllers/commentController.js';

const router = express.Router();

router.get('/:videoId',   commentController.getByVideoId);
router.post('/:videoId',  commentController.create);
router.delete('/:id',     authMiddleware, commentController.remove);

export default router;