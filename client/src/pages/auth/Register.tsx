import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/Auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try { 
      const loggedUser = await signUp(form.email, form.password, form.full_name, 'user');
      if (loggedUser?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
    catch (err: any) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light">
        <div className="absolute inset-0 stars-pattern" />
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center"><Sparkles className="w-12 h-12 text-cosmic-dark" /></div>
          <h2 className="text-4xl font-display font-bold mb-4">Join Celestial Guidance</h2>
          <p className="text-white/80 max-w-md mb-8">Start your cosmic journey today</p>
          <div className="space-y-4 text-left">{['Shop spiritual products', 'Free Kundli generation', 'Browse expert astrologers'].map((b, i) => (
            <motion.div key={b} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center text-white/90">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center mr-3"><Check className="w-4 h-4 text-gold-light" /></div>{b}
            </motion.div>
          ))}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cosmic-purple to-secondary-600 rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>
              <span className="font-display text-2xl font-bold">Celestial Guidance</span>
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Create your account to shop &amp; save astrologers</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field pl-11" placeholder="John Doe" required /></div></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="your@email.com" required /></div></div>
            <div><label className="block text-sm font-medium mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div></div>
            <div><label className="block text-sm font-medium mb-1">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="input-field pl-11" required /></div></div>
            <div className="flex items-start">
              <input type="checkbox" id="terms" checked={form.agreeTerms} onChange={e => setForm({ ...form, agreeTerms: e.target.checked })} className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">I agree to the <Link to="/terms" className="text-primary-600">Terms</Link> and <Link to="/privacy" className="text-primary-600">Privacy Policy</Link></label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create Account'}<ArrowRight className="w-5 h-5 ml-2" /></button>
          </form>

          <p className="text-center mt-6 text-gray-600">Already have an account? <Link to="/auth/login" className="text-primary-600 font-medium">Sign In</Link></p>
        </motion.div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>; }
