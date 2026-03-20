// server/services/videoService.js
import * as videoRepository from '../repositories/videoRepository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAll = async (search, categoriaId) => {
  return await videoRepository.findAll({ search, categoriaId });
};

export const getById = async (id) => {
  const video = await videoRepository.findById(id);
  if (!video) {
    throw new Error('Video no encontrado.');
  }
  return video;
};

export const create = async (titulo, descripcion, filename, categoriaId) => {
  if (!titulo) throw new Error('El título del video es requerido.');
  if (!filename) throw new Error('El archivo de video es requerido.');
  return await videoRepository.create(titulo, descripcion, filename, categoriaId);
};

export const update = async (id, titulo, descripcion, categoriaId) => {
  await getById(id); // valida que exista
  return await videoRepository.update(id, titulo, descripcion, categoriaId);
};

export const remove = async (id) => {
  const video = await getById(id); // valida que exista

  // Borra el archivo físico del servidor
  const filePath = path.join(__dirname, '..', 'uploads', video.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await videoRepository.remove(id);
};