// server/controllers/commentController.js
import * as commentService from '../services/commentService.js';

export const getByVideoId = async (req, res) => {
  try {
    const comments = await commentService.getByVideoId(req.params.videoId);
    res.json(comments);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { autor, texto } = req.body;
    const comment = await commentService.create(
      req.params.videoId,
      autor,
      texto
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await commentService.remove(req.params.id);
    res.json({ message: 'Comentario eliminado correctamente.' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getWatched = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: 'sessionId requerido.' });
    const ids = await commentService.getWatched(sessionId);
    res.json(ids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markWatched = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId requerido.' });
    await commentService.markWatched(sessionId, req.params.videoId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};