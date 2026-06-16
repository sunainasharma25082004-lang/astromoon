import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { isValidObjectId } from '../utils/helpers.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ is_active: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category, description, short_description, price, original_price, images, stock, specifications } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const product = await Product.create({
      name,
      slug: slugify(name) + '-' + Date.now(),
      category: category || 'Gemstones',
      description,
      short_description,
      price: Number(price),
      original_price: original_price ? Number(original_price) : undefined,
      images: images || [],
      stock: stock ?? 50,
      specifications: specifications || {},
      is_active: true,
    });
    emitPanelUpdate(req.app.get('io'), { resource: RESOURCES.ORDERS, admin: true });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const allowed = ['name', 'category', 'description', 'short_description', 'price', 'original_price', 'images', 'stock', 'is_active', 'specifications'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    await Product.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;