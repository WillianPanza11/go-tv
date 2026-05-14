import pool from '../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT id, nombre, descripcion, mimetype, size, created_at FROM documents ORDER BY created_at DESC'
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM documents WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ nombre, descripcion, mimetype, size, data }) => {
  const { rows } = await pool.query(
    `INSERT INTO documents (nombre, descripcion, mimetype, size, data)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, descripcion, mimetype, size, created_at`,
    [nombre, descripcion, mimetype, size, data]
  );
  return rows[0];
};

export const remove = async (id) => {
  await pool.query('DELETE FROM documents WHERE id = $1', [id]);
};
