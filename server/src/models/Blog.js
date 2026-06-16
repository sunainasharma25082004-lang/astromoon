import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: String, required: true },
  category: String,
  tags: [String],
  image_url: String,
  author_name: String,
  read_time: String,
  status: { type: String, default: 'published' },
  published_at: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);
