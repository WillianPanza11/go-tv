// server/controllers/authController.js
import { loginService } from '../services/authService.js';

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