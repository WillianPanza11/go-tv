// server/routes/auth.js
import express from 'express';
import { login, guestLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/guest', guestLogin);

export default router;