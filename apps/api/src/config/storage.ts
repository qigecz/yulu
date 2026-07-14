import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

/**
 * Local filesystem storage for uploaded images.
 *
 * Files land in `<api>/uploads/` and are served via `express.static` at the
 * PUBLIC_PATH prefix. The storage layer is isolated here so it can be swapped
 * for S3 / Supabase Storage later without touching the route.
 */
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const PUBLIC_PATH = '/uploads';
export const MAX_FILES = 9;
export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持图片文件'));
  },
});
