import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronLeft, Minus, Plus } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '../../utils/dateUtils';
import { Button } from '../../components/common/Button';

import { apiFetch } from '../../config/api';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  images: string[];
  rating: number;
  total_reviews: number;
  stock: number;
  specifications?: Record<string, string>;
  category: { name: string; slug: string } | null;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/products/${id}`);
      const normalized = { ...data, id: data._id || data.id };
      setProduct(normalized);
      setSelectedImage(0);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse grid lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/shop" className="text-primary-600 hover:underline">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <img
                src={product.images?.[selectedImage] || 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </motion.div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {product.category && (
                <Link
                  to={`/shop?category=${product.category.slug}`}
                  className="text-sm text-primary-600 font-medium hover:underline"
                >
                  {product.category.name}
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-2 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i <= product.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{product.rating} ({product.total_reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.original_price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-md">
                      {calculateDiscount(product.price, product.original_price)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-600 mb-6">{product.short_description}</p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <Button variant="primary" size="lg" className="flex-1">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - {formatCurrency(product.price * quantity)}
                </Button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stock */}
              <div className="text-sm text-gray-600 mb-4">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
                {[
                  { icon: Truck, text: 'Free Shipping' },
                  { icon: Shield, text: '100% Genuine' },
                  { icon: RotateCcw, text: 'Easy Returns' },
                ].map((feature) => (
                  <div key={feature.text} className="text-center">
                    <feature.icon className="w-5 h-5 mx-auto text-primary-600 mb-1" />
                    <span className="text-xs text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
