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

function parseBase64Image(image) {
  if (!image || typeof image !== 'string') {
    throw new Error('Image data is required');
  }

  const match = image.match(/^data:image\/([\w+.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image format. Use JPG, PNG or WEBP.');
  }

  let ext = match[1].toLowerCase().replace('jpeg', 'jpg');
  if (ext === 'pjpeg') ext = 'jpg';
  if (!ALLOWED_TYPES.has(ext)) {
    throw new Error('Only JPG, PNG, WEBP or GIF images allowed');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 2 * 1024 * 1024) {
    throw new Error('Image too large. Maximum size is 2MB.');
  }

  return { buffer, ext, dataUrl: image };
}

function saveToDisk(buffer, ext, subdir) {
  const dir = path.join(UPLOAD_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}

function badRequest(error, res) {
  const clientErrors = ['required', 'Invalid', 'Only', 'large'];
  const status = clientErrors.some((k) => error.message.includes(k)) ? 400 : 500;
  res.status(status).json({ message: error.message || 'Image upload failed' });
}

router.post('/product-image', protect, authorize('admin'), async (req, res) => {
  try {
    const { buffer, ext } = parseBase64Image(req.body.image);
    const url = saveToDisk(buffer, ext, 'products');
    res.status(201).json({ url, filename: path.basename(url) });
  } catch (error) {
    badRequest(error, res);
  }
});

/** Astrologer images stored as data URL in DB (works on Render — no disk needed) */
router.post('/astrologer-image', protect, authorize('astrologer'), async (req, res) => {
  try {
    const { dataUrl } = parseBase64Image(req.body.image);
    res.status(201).json({ url: dataUrl });
  } catch (error) {
    badRequest(error, res);
  }
});

export default router;