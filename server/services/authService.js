// server/services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Al iniciar el servidor, hasheamos la contraseña del .env una sola vez
// Equivalente a tener un usuario hardcodeado en memoria
const APP_USER = process.env.APP_USER;
const APP_PASSWORD_HASH = await bcrypt.hash(process.env.APP_PASSWORD, 10);

export const loginService = async (username, password) => {

  // Verificar usuario
  if (username !== APP_USER) {
    throw new Error('Credenciales incorrectas.');
  }

  // Verificar contraseña
  const passwordMatch = await bcrypt.compare(password, APP_PASSWORD_HASH);
  if (!passwordMatch) {
    throw new Error('Credenciales incorrectas.');
  }

  // Generar token JWT — expira en 8 horas
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return token;
};