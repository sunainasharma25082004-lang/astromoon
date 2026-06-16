import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  category: { type: String, default: 'Gemstones' },
  description: String,
  short_description: String,
  price: { type: Number, required: true },
  original_price: Number,
  images: [String],
  stock: { type: Number, default: 50 },
  rating: { type: Number, default: 4.7 },
  total_reviews: { type: Number, default: 40 },
  is_active: { type: Boolean, default: true },
  specifications: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
