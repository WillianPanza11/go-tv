import multer from 'multer';

const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
];

const ALLOWED_EXTENSIONS = ['.zip', '.rar', '.7z', '.gz', '.tar'];

const uploadDocs = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    const isAllowed = ALLOWED_MIMETYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes, documentos (PDF, Word, Excel, PowerPoint) o comprimidos (ZIP, RAR, 7Z).'));
    }
  },
});

export default uploadDocs;
