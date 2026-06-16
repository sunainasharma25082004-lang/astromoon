import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'published' };
    if (category) query.category = category;

    const blogs = await Blog.find(query).sort({ published_at: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
