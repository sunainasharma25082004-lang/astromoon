export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  birth_time?: string;
  birth_place?: string;
  gender?: 'male' | 'female' | 'other';
  zodiac_sign?: string;
  wallet_balance: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Astrologer {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  expertise: string[];
  languages: string[];
  experience: number;
  bio: string;
  education?: string;
  certifications?: string[];
  chat_price: number;
  call_price: number;
  video_price: number;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  is_online: boolean;
  is_verified: boolean;
  is_available: boolean;
  available_slots?: AvailableSlot[];
  created_at: string;
}

export interface AvailableSlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface Review {
  id: string;
  user_id: string;
  astrologer_id: string;
  rating: number;
  comment: string;
  consultation_type: 'chat' | 'call' | 'video';
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  astrologer_id: string;
  type: 'chat' | 'call' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_amount?: number;
  rating?: number;
  review?: string;
  astrologer: Astrologer;
  created_at: string;
}

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  balance_after: number;
  reference_type: 'recharge' | 'consultation' | 'refund' | 'withdrawal';
  reference_id?: string;
  description: string;
  payment_id?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  images: string[];
  stock: number;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  is Featured: boolean;
  specifications?: Record<string, string>;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  coupon_code?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Kundli {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  latitude: number;
  longitude: number;
  zodiac_sign: string;
  moon_sign: string;
  sun_sign: string;
  ascendant: string;
  nakshatra: string;
  planetary_positions: PlanetaryPosition[];
  houses: House[];
  doshas: Dosha[];
  created_at: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  is_retrograde: boolean;
}

export interface House {
  number: number;
  sign: string;
  planets: string[];
}

export interface Dosha {
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  description: string;
  remedies: string[];
}

export interface KundliMatch {
  id: string;
  boy_kundli_id: string;
  girl_kundli_id: string;
  compatibility_score: number;
  guna_milan: {
    total: number;
    maximum: number;
    details: GunaDetail[];
  };
  manglik_status: {
    boy: boolean;
    girl: boolean;
    compatibility: boolean;
  };
  conclusion: string;
  recommendation: string;
  created_at: string;
}

export interface GunaDetail {
  name: string;
  boy_score: number;
  girl_score: number;
  maximum: number;
  description: string;
}

export interface Horoscope {
  id: string;
  zodiac_sign: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  prediction: {
    overall: string;
    career: string;
    love: string;
    finance: string;
    health: string;
  };
  lucky_number: string;
  lucky_color: string;
  lucky_day: string;
  mood: string;
  compatibility: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  author_name: string;
  author_avatar?: string;
  read_time: string;
  published_at: string;
  status: 'draft' | 'published';
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'consultation' | 'order' | 'wallet' | 'system' | 'promo';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}
