import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import './config/db.js';

import authRoutes     from './routes/auth.js';
import videoRoutes    from './routes/videos.js';
import categoryRoutes from './routes/categories.js';
import commentRoutes  from './routes/comments.js';
import documentRoutes from './routes/documents.js';
import apkRoutes      from './routes/apks.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
//const distPath = 'C:\\Users\\willian.panza\\Documents\\SOPORTE-GOTV\\client\\dist';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ── Servir videos con Range Requests ─────────────────
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Video no encontrado.' });
  }

  const stat     = fs.statSync(filePath);
  const fileSize = stat.size;
  const range    = req.headers.range;

  if (range) {
    const parts     = range.replace(/bytes=/, '').split('-');
    const start     = parseInt(parts[0], 10);
    const end       = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges':  'bytes',
      'Content-Length': chunkSize,
      'Content-Type':   'video/mp4',
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type':   'video/mp4',
      'Accept-Ranges':  'bytes',
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

// ── API ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/videos',     videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments',   commentRoutes);
app.use('/api/documents',  documentRoutes);
app.use('/api/apks',       apkRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// ── Servir frontend de Vue en producción ──────────────
//console.log('📁 Dist existe:', fs.existsSync(distPath));
//console.log('📁 index.html existe:', fs.existsSync(distPath + '\\index.html'));

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
//app.use(express.static(distPath));
/*app.get('/{*path}', (req, res) => {
  res.sendFile(distPath + '\\index.html');
});*/

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://192.168.57.60:${PORT}`);
});