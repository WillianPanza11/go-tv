import { Router } from 'express';
import uploadApk from '../config/uploadApk.js';
import auth from '../middleware/auth.js';
import { verifyPin, getAll, download, create, remove } from '../controllers/apkController.js';

const router = Router();

router.post('/verify-pin', auth, verifyPin);
router.get('/',            auth, getAll);
router.get('/:id/file',    auth, download);
router.post('/',           auth, uploadApk.single('file'), create);
router.delete('/:id',      auth, remove);

export default router;
