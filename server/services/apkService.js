import * as repo from '../repositories/apkRepository.js';

export const getAll  = ()                              => repo.findAll();
export const getById = (id)                            => repo.findById(id);
export const create  = ({ nombre, descripcion, size, data }) =>
  repo.create({ nombre, descripcion, size, data });
export const remove  = (id)                            => repo.remove(id);
