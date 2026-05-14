// server/controllers/videoController.js
import * as videoService from '../services/videoService.js';
import convertToMp4 from '../config/converter.js';
import path from 'path';

export const getAll = async (req, res) => {
  try {
    const { search, categoriaId } = req.query;
    const videos = await videoService.getAll(search, categoriaId);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const video = await videoService.getById(req.params.id);
    res.json(video);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'El archivo de video es requerido.' });
    }

    const { titulo, descripcion, categoriaId } = req.body;
    let filename = req.file.filename;

    // Convierte cualquier formato que no sea mp4 o webm
    const ext = path.extname(req.file.filename).toLowerCase();
    if (ext !== '.mp4' && ext !== '.webm') {
      const inputPath = req.file.path;
      const outputPath = await convertToMp4(inputPath);
      filename = path.basename(outputPath);
    }

    const video = await videoService.create(
      titulo,
      descripcion,
      filename,
      categoriaId
    );

    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { titulo, descripcion, categoriaId } = req.body;
    const video = await videoService.update(req.params.id, titulo, descripcion, categoriaId);
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await videoService.remove(req.params.id);
    res.json({ message: 'Video eliminado correctamente.' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};