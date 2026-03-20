// server/controllers/categoryController.js
import * as categoryService from '../services/categoryService.js';

export const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const category = await categoryService.create(nombre, color);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const category = await categoryService.update(req.params.id, nombre, color);
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await categoryService.remove(req.params.id);
    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};