// server/repositories/commentRepository.js
import pool from '../config/db.js';

export const findByVideoId = async (videoId) => {
  const { rows } = await pool.query(`
    SELECT * FROM comments
    WHERE video_id = $1
    ORDER BY created_at ASC
  `, [videoId]);
  return rows;
};

export const create = async (videoId, autor, texto) => {
  const { rows } = await pool.query(`
    INSERT INTO comments (video_id, autor, texto)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [videoId, autor, texto]);
  return rows[0];
};

export const remove = async (id) => {
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
};