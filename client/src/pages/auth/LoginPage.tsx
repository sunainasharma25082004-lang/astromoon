import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/Auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '', step: 'input' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'email') { await signIn(form.email, form.password); navigate('/dashboard'); }
    } catch (err: any) { setError(err.message || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cosmic-purple to-secondary-600 rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>
              <span className="font-display text-2xl font-bold">Celestial Guidance</span>
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setMode('email')} className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}><Mail className="w-4 h-4 inline mr-2" />Email</button>
            <button onClick={() => setMode('phone')} className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${mode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}><Phone className="w-4 h-4 inline mr-2" />Phone</button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'email' ? (
              <>
                <div><label className="block text-sm font-medium mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="your@email.com" required /></div></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div></div>
                <div className="flex justify-end"><Link to="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot Password?</Link></div>
              </>
            ) : (
              <div><label className="block text-sm font-medium mb-1">Phone Number</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-11" placeholder="+91 98765 43210" /></div></div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}<ArrowRight className="w-5 h-5 ml-2" /></button>
          </form>

          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 text-gray-500">or continue with</span></div></div>

          <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.23v2.84C4.03 21.01 7.72 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.23C1.45 8.55 1 10.22 1 12s.45 3.48 1.23 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.57-3.57C17.46 2.07 14.97 1 12 1 7.72 1 4.03 2.95 2.23 6.07L5.84 9.09C6.72 6.54 9.15 4.61 12 5.38z" /></svg>
            Sign in with Google
          </button>

          <p className="text-center mt-6 text-gray-600">New here? <Link to="/auth/register" className="text-primary-600 font-medium hover:text-primary-700">Create an Account</Link></p>
        </motion.div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light">
        <div className="absolute inset-0 stars-pattern" />
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center"><Sparkles className="w-12 h-12 text-cosmic-dark" /></div>
          <h2 className="text-4xl font-display font-bold mb-4">Discover Your Path</h2>
          <p className="text-white/80 max-w-md mb-8">Connect with expert astrologers for personalized guidance.</p>
          <div className="flex justify-center gap-8">{[{ v: '500+', l: 'Astrologers' }, { v: '1M+', l: 'Users' }, { v: '4.9', l: 'Rating' }].map(s => <div key={s.l} className="text-center"><div className="text-3xl font-bold text-gold-light">{s.v}</div><div className="text-white/60 text-sm">{s.l}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}
