import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

const ALLOWED_TYPES = new Set(['jpeg', 'jpg', 'png', 'webp', 'gif']);

function saveBase64Image(image, subdir) {
  if (!image || typeof image !== 'string') {
    throw new Error('Image data is required');
  }

  const match = image.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image format. Use JPG, PNG or WEBP.');
  }

  let ext = match[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (!ALLOWED_TYPES.has(ext)) {
    throw new Error('Only JPG, PNG, WEBP or GIF images allowed');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Image too large. Maximum size is 5MB.');
  }

  const dir = path.join(UPLOAD_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);

  return { url: `/uploads/${subdir}/${filename}`, filename };
}

router.post('/product-image', protect, authorize('admin'), async (req, res) => {
  try {
    const result = saveBase64Image(req.body.image, 'products');
    res.status(201).json(result);
  } catch (error) {
    res.status(error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('Only') || error.message.includes('large') ? 400 : 500)
      .json({ message: error.message || 'Image upload failed' });
  }
});

router.post('/astrologer-image', protect, authorize('astrologer'), async (req, res) => {
  try {
    const result = saveBase64Image(req.body.image, 'astrologers');
    res.status(201).json(result);
  } catch (error) {
    res.status(error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('Only') || error.message.includes('large') ? 400 : 500)
      .json({ message: error.message || 'Image upload failed' });
  }
});

export default router;