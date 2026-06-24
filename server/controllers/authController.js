// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { loginService } from '../services/authService.js';
dotenv.config();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const token = await loginService(username, password);

    res.json({ token });

  } catch (err) {
    // Si el service lanza un error lo capturamos aquí
    res.status(401).json({ message: err.message });
  }
};

export const guestLogin = (_req, res) => {
  const token = jwt.sign(
    { username: 'invitado', role: 'guest' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
};