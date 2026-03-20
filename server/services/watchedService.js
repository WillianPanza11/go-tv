// server/services/watchedService.js
import * as watchedRepository from '../repositories/watchedRepository.js';

export const markAsWatched = async (sessionId, videoId) => {
  if (!sessionId) throw new Error('Session ID requerido.');
  await watchedRepository.markAsWatched(sessionId, videoId);
};

export const getWatchedBySession = async (sessionId) => {
  if (!sessionId) throw new Error('Session ID requerido.');
  return await watchedRepository.getWatchedBySession(sessionId);
};