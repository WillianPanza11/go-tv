// server/services/categoryService.js
import * as categoryRepository from '../repositories/categoryRepository.js';

export const getAll = async () => {
  return await categoryRepository.findAll();
};

export const getById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new Error('Categoría no encontrada.');
  }
  return category;
};

export const create = async (nombre, color) => {
  if (!nombre) {
    throw new Error('El nombre de la categoría es requerido.');
  }
  return await categoryRepository.create(nombre, color || '#3B82F6');
};

export const update = async (id, nombre, color) => {
  await getById(id); // valida que exista
  return await categoryRepository.update(id, nombre, color);
};

export const remove = async (id) => {
  await getById(id); // valida que exista
  await categoryRepository.remove(id);
};