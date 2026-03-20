// server/routes/categories.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Todas las rutas de categorías requieren token
router.get('/',        authMiddleware, categoryController.getAll);
router.get('/:id',     authMiddleware, categoryController.getById);
router.post('/',       authMiddleware, categoryController.create);
router.put('/:id',     authMiddleware, categoryController.update);
router.delete('/:id',  authMiddleware, categoryController.remove);

export default router;