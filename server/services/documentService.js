import * as repo from '../repositories/documentRepository.js';

export const getAll = () => repo.findAll();

export const getById = (id) => repo.findById(id);

export const create = ({ nombre, descripcion, mimetype, size, data }) =>
  repo.create({ nombre, descripcion, mimetype, size, data });

export const remove = (id) => repo.remove(id);
