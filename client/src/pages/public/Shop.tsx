import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Search, X, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/Auth';
import toast from 'react-hot-toast';

import { apiFetch } from '../../config/api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  image: string;
  rating: number;
  reviews: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [showCart, setShowCart] = useState(false);

  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { token, isAuthenticated, refreshUser } = useAuth();

  const categories = ['All', 'Gemstones', 'Rudraksha', 'Yantras', 'Crystals', 'Bracelets'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/products');
      const mapped = (data || []).map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        category: p.category || 'Gemstones',
        price: p.price,
        original_price: p.original_price,
        image: p.images?.[0] || 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: p.rating || 4.7,
        reviews: p.total_reviews || 40,
      }));
      setProducts(mapped);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'All' || p.category === activeCat;
    return matchSearch && matchCat;
  });

  const handleAdd = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
    toast.success(`Added ${p.name} to cart`);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated || !token) {
      toast.error('Please login to checkout');
      setShowCart(false);
      return;
    }

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity
          })),
          total: totalPrice
        })
      }, token);
      toast.success(`Order placed! Total: ${formatCurrency(totalPrice)}`);
      if (refreshUser) await refreshUser();
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed');
    }

    clearCart();
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm mb-3"><ShoppingBag className="w-4 h-4 mr-1.5" />Authentic • Energized</div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">Spiritual Shop</h1>
          </div>
          <button onClick={() => setShowCart(true)} className="flex items-center self-start md:self-auto gap-2 bg-white border px-5 py-2 rounded-xl hover:shadow font-medium text-sm">
            <ShoppingCart className="w-4 h-4" /> Cart ({totalItems}) • {formatCurrency(totalPrice)}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gemstones, rudraksha..." className="w-full bg-white border pl-11 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-2 text-sm font-medium rounded-2xl transition border ${activeCat === cat ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, idx) => (
              <motion.div key={p.id} whileHover={{ y: -4 }} className="group bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative">
                  <img src={p.image} alt={p.name} className="h-52 w-full object-cover group-hover:scale-[1.04] transition" />
                  {p.original_price && <div className="absolute top-3 left-3 text-xs bg-red-600 text-white px-2.5 py-px rounded">{Math.round(100 - (p.price / p.original_price) * 100)}% OFF</div>}
                  <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full"><Heart className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-widest text-primary-600 font-medium mb-0.5">{p.category}</div>
                  <Link to={`/shop/product/${p.id}`} className="font-semibold text-lg leading-snug hover:text-primary-600 mb-1 line-clamp-2">{p.name}</Link>
                  <div className="flex items-center text-sm mb-3"><Star className="text-amber-400 w-4 h-4 fill-current" /><span className="ml-1 text-gray-600">{p.rating} ({p.reviews})</span></div>
                  <div className="mt-auto flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-xl">{formatCurrency(p.price)}</span>
                      {p.original_price && <span className="line-through text-xs ml-2 text-gray-400">{formatCurrency(p.original_price)}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/shop/product/${p.id}`} className="text-xs px-3 py-2 rounded-xl border">Details</Link>
                      <button onClick={() => handleAdd(p)} className="text-xs px-4 py-2 rounded-xl bg-primary-600 text-white active:bg-primary-700">Add to Cart</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-[120] flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-md bg-white h-full overflow-auto shadow-2xl flex flex-col">
            <div className="p-5 flex items-center border-b">
              <div className="font-semibold flex-1">Your Cart ({totalItems})</div>
              <button onClick={() => setShowCart(false)}><X /></button>
            </div>
            {items.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Cart is empty. Add beautiful spiritual items!</div>
            ) : (
              <>
                <div className="p-5 space-y-4 flex-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 text-sm">
                        <div className="font-medium pr-6">{item.name}</div>
                        <div className="text-primary-600 font-semibold">{formatCurrency(item.price)}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="border px-2 rounded">-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="border px-2 rounded">+</button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500 text-xs">Remove</button>
                        </div>
                      </div>
                      <div className="font-semibold text-right">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t mt-auto">
                  <div className="flex justify-between text-lg font-semibold mb-4"><span>Total</span><span>{formatCurrency(totalPrice)}</span></div>
                  <button onClick={handleCheckout} className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl">Checkout &amp; Pay</button>
                  <button onClick={clearCart} className="w-full text-sm mt-3 text-gray-500">Clear cart</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
