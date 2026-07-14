import { Router, Request } from 'express';
import fs from 'fs';
import { upload, UPLOAD_DIR, PUBLIC_PATH, MAX_FILES } from '../config/storage';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Ensure the upload directory exists at boot.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * POST /api/uploads  (auth required, multipart/form-data, field "images")
 * Returns absolute URLs for each stored file.
 */
router.post(
  '/',
  authMiddleware,
  upload.array('images', MAX_FILES),
  (req: AuthRequest, res) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) {
      return res.status(400).json({ error: '未提供图片' });
    }
    const base = `${req.protocol}://${req.get('host')}`;
    const urls = files.map((f) => `${base}${PUBLIC_PATH}/${f.filename}`);
    res.status(201).json({ urls });
  },
);

export default router;
