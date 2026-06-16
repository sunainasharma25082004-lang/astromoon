import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product_id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  payment_status: { type: String, default: 'completed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
