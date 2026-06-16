import express from 'express';
import Content from '../models/Content.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:type', async (req, res) => {
  const items = await Content.find({ type: req.params.type, is_active: true })
    .sort({ sort_order: 1 });
  res.json(items);
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  const items = await Content.find().sort({ type: 1, sort_order: 1 });
  res.json(items);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const item = await Content.create(req.body);
  res.status(201).json(item);
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  const item = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Content.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;