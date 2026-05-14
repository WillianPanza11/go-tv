import * as service from '../services/documentService.js';

export const getAll = async (_req, res) => {
  try {
    const docs = await service.getAll();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const download = async (req, res) => {
  try {
    const doc = await service.getById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado.' });

    res.setHeader('Content-Type', doc.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${doc.nombre}"`);
    res.send(doc.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo.' });

    const { nombre, descripcion } = req.body;
    const doc = await service.create({
      nombre:      nombre || req.file.originalname,
      descripcion: descripcion || '',
      mimetype:    req.file.mimetype,
      size:        req.file.size,
      data:        req.file.buffer,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const doc = await service.getById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado.' });

    await service.remove(req.params.id);
    res.json({ message: 'Documento eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
