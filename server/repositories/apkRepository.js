import pool from '../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT id, nombre, descripcion, size, created_at FROM apks ORDER BY created_at DESC'
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM apks WHERE id = $1', [id]);
  return rows[0] || null;
};

export const create = async ({ nombre, descripcion, size, data }) => {
  const { rows } = await pool.query(
    `INSERT INTO apks (nombre, descripcion, size, data)
     VALUES ($1, $2, $3, $4) RETURNING id, nombre, descripcion, size, created_at`,
    [nombre, descripcion, size, data]
  );
  return rows[0];
};

export const remove = async (id) => {
  await pool.query('DELETE FROM apks WHERE id = $1', [id]);
};
