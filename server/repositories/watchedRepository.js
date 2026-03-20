// server/repositories/watchedRepository.js
import pool from '../config/db.js';

// Marca un video como visto para una sesión
export const markAsWatched = async (sessionId, videoId) => {
  await pool.query(`
    INSERT INTO watched (session_id, video_id)
    VALUES ($1, $2)
    ON CONFLICT (session_id, video_id) DO NOTHING
  `, [sessionId, videoId]);
};

// Obtiene todos los video_id vistos por una sesión
export const getWatchedBySession = async (sessionId) => {
  const { rows } = await pool.query(`
    SELECT video_id FROM watched
    WHERE session_id = $1
  `, [sessionId]);
  return rows.map(r => r.video_id);
};