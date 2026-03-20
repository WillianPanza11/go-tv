// server/routes/videos.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import upload from '../config/upload.js';
import * as videoController from '../controllers/videoController.js';

const router = express.Router();

router.get('/',      authMiddleware, videoController.getAll);
router.get('/:id',   authMiddleware, videoController.getById);

// upload.single('video') ← multer intercepta el archivo antes del controller
router.post('/',     authMiddleware, upload.single('video'), videoController.create);
router.put('/:id',   authMiddleware, videoController.update);
router.delete('/:id',authMiddleware, videoController.remove);

export default router;