// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verifica que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // adjunta los datos del token al request
    next(); // deja pasar al controller
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

export default authMiddleware;