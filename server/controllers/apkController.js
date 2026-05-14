import * as service from '../services/apkService.js';

const getPin = () => process.env.APK_PIN || '1234';

export const verifyPin = (req, res) => {
  const { pin } = req.body;
  if (String(pin) === getPin()) {
    res.json({ ok: true });
  } else {
    res.status(400).json({ message: 'Contraseña incorrecta.' });
  }
};

export const getAll = async (_req, res) => {
  try {
    res.json(await service.getAll());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const download = async (req, res) => {
  try {
    const apk = await service.getById(req.params.id);
    if (!apk) return res.status(404).json({ message: 'APK no encontrado.' });

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${apk.nombre}"`);
    res.send(apk.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo.' });

    const { nombre, descripcion, pin } = req.body;
    if (String(pin) !== getPin()) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    const apk = await service.create({
      nombre:      nombre || req.file.originalname,
      descripcion: descripcion || '',
      size:        req.file.size,
      data:        req.file.buffer,
    });

    res.status(201).json(apk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const apk = await service.getById(req.params.id);
    if (!apk) return res.status(404).json({ message: 'APK no encontrado.' });

    await service.remove(req.params.id);
    res.json({ message: 'APK eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
