import multer from 'multer';

const uploadApk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, file, cb) => {
    const isApk =
      file.mimetype === 'application/vnd.android.package-archive' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.toLowerCase().endsWith('.apk');
    if (isApk) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos APK (.apk).'));
    }
  },
});

export default uploadApk;
