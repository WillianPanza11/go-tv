// server/repositories/videoRepository.js
import pool from '../config/db.js';

export const findAll = async ({ search, categoriaId }) => {
  let query = `
    SELECT 
      v.id,
      v.titulo,
      v.descripcion,
      v.filename,
      v.created_at,
      c.id   AS categoria_id,
      c.nombre AS categoria_nombre,
      c.color  AS categoria_color
    FROM videos v
    LEFT JOIN categories c ON v.categoria_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // Filtro por búsqueda
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (v.titulo ILIKE $${params.length} OR v.descripcion ILIKE $${params.length})`;
  }

  // Filtro por categoría
  if (categoriaId) {
    params.push(categoriaId);
    query += ` AND v.categoria_id = $${params.length}`;
  }

  query += ' ORDER BY v.created_at DESC';

  const { rows } = await pool.query(query, params);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(`
    SELECT 
      v.id,
      v.titulo,
      v.descripcion,
      v.filename,
      v.created_at,
      c.id     AS categoria_id,
      c.nombre AS categoria_nombre,
      c.color  AS categoria_color
    FROM videos v
    LEFT JOIN categories c ON v.categoria_id = c.id
    WHERE v.id = $1
  `, [id]);
  return rows[0];
};

export const create = async (titulo, descripcion, filename, categoriaId) => {
  const { rows } = await pool.query(`
    INSERT INTO videos (titulo, descripcion, filename, categoria_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [titulo, descripcion, filename, categoriaId || null]);
  return rows[0];
};

export const update = async (id, titulo, descripcion, categoriaId) => {
  const { rows } = await pool.query(`
    UPDATE videos 
    SET titulo = $1, descripcion = $2, categoria_id = $3
    WHERE id = $4
    RETURNING *
  `, [titulo, descripcion, categoriaId || null, id]);
  return rows[0];
};

export const remove = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM videos WHERE id = $1 RETURNING filename',
    [id]
  );
  return rows[0]; // devuelve el filename para borrar el archivo físico
};