import { Router } from 'express';
import uploadDocs from '../config/uploadDocs.js';
import auth from '../middleware/auth.js';
import { getAll, download, create, remove } from '../controllers/documentController.js';

const router = Router();

router.get('/',           auth, getAll);
router.get('/:id/file',   auth, download);
router.post('/',          auth, uploadDocs.single('file'), create);
router.delete('/:id',     auth, remove);

export default router;
