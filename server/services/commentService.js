// server/services/commentService.js
import * as commentRepository from '../repositories/commentRepository.js';
import * as videoRepository from '../repositories/videoRepository.js';

export const getByVideoId = async (videoId) => {
  // Verifica que el video exista
  const video = await videoRepository.findById(videoId);
  if (!video) throw new Error('Video no encontrado.');
  return await commentRepository.findByVideoId(videoId);
};

export const create = async (videoId, autor, texto) => {
  if (!autor) throw new Error('El autor es requerido.');
  if (!texto)  throw new Error('El comentario no puede estar vacío.');
  return await commentRepository.create(videoId, autor, texto);
};

export const remove = async (id) => {
  await commentRepository.remove(id);
};