import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const products = [
  { id: '1', name: 'Yellow Sapphire (Pukhraj)', category: 'Gemstones', price: 15000, original_price: 18000, image: 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.8, reviews: 45 },
  { id: '2', name: '5 Mukhi Rudraksha', category: 'Rudraksha', price: 2500, original_price: 3000, image: 'https://images.pexels.com/photos/209620/pexels-photo-209620.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.7, reviews: 89 },
  { id: '3', name: 'Shree Yantra - Copper', category: 'Yantras', price: 3500, original_price: 4000, image: 'https://images.pexels.com/photos/373968/pexels-photo-373968.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.9, reviews: 120 },
  { id: '4', name: 'Blue Sapphire (Neelam)', category: 'Gemstones', price: 22000, image: 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.6, reviews: 34 },
];

export function ShopSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-700 mb-4">
              <ShoppingBag className="w-4 h-4 mr-2" />Astrology Shop
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Gemstones & Remedies</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center text-primary-600 font-medium">View All<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden group">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                {product.original_price && <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs rounded">{Math.round((1 - product.price / product.original_price) * 100)}% OFF</span>}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="p-4">
                <div className="text-xs text-primary-600 font-medium mb-1">{product.category}</div>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-3"><Star className="w-4 h-4 text-amber-400 fill-current" /><span className="text-sm text-gray-600 ml-1">{product.rating} ({product.reviews})</span></div>
                <div className="flex items-center justify-between">
                  <div><span className="text-lg font-bold">{formatCurrency(product.price)}</span>{product.original_price && <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(product.original_price)}</span>}</div>
                  <Link to={`/shop/product/${product.id}`} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Add</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
