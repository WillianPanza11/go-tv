// server/controllers/watchedController.js
import * as watchedService from '../services/watchedService.js';

export const markAsWatched = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { videoId } = req.params;
    await watchedService.markAsWatched(sessionId, videoId);
    res.json({ message: 'Video marcado como visto.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getWatchedBySession = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const watched = await watchedService.getWatchedBySession(sessionId);
    res.json(watched);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};