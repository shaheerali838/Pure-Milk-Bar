import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();

// Memory storage for multer (max 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, AVIF, GIF) are allowed'), false);
    }
  },
});

// POST /api/v1/upload/image
router.post('/image', upload.single('file'), uploadImage);
router.post('/', upload.single('image'), uploadImage);

export default router;
