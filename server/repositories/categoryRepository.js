// server/repositories/categoryRepository.js
import pool from '../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM categories ORDER BY nombre ASC'
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return rows[0];
};

export const create = async (nombre, color) => {
  const { rows } = await pool.query(
    'INSERT INTO categories (nombre, color) VALUES ($1, $2) RETURNING *',
    [nombre, color]
  );
  return rows[0];
};

export const update = async (id, nombre, color) => {
  const { rows } = await pool.query(
    'UPDATE categories SET nombre = $1, color = $2 WHERE id = $3 RETURNING *',
    [nombre, color, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
};