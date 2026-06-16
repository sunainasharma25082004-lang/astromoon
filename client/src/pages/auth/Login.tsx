import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Sparkles, User, Users } from 'lucide-react';
import { useAuth } from '../../context/Auth';

type LoginRole = 'user' | 'astrologer';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, sendOtp, signInOtp } = useAuth();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('user');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'astrologer' || role === 'user') setSelectedRole(role);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'email') {
        const loggedUser = await signIn(form.email, form.password);
        const role = loggedUser.role || 'user';

        // Role-based redirect (respects what is actually stored in DB)
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'astrologer') {
          navigate('/astro');
        } else {
          navigate('/dashboard');
        }
      } else if (!otpSent) {
        await sendOtp(form.phone);
        setOtpSent(true);
        setError('');
      } else {
        const loggedUser = await signInOtp(form.phone, form.otp);
        const role = loggedUser.role || 'user';
        if (role === 'admin') navigate('/admin');
        else if (role === 'astrologer') navigate('/astro');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
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

          {/* Role selector - asks at login time as requested */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 mb-2 tracking-wider">LOGIN AS</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${selectedRole === 'user' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="w-6 h-6" />
                <div>
                  <div className="font-semibold">User</div>
                  <div className="text-[11px] text-gray-500">Seek guidance &amp; consultations</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('astrologer')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${selectedRole === 'astrologer' 
                  ? 'border-cosmic-purple bg-purple-50 text-cosmic-purple shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <Users className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Astrologer</div>
                  <div className="text-[11px] text-gray-500">Professional dashboard</div>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-center mt-1.5 text-gray-400">Your actual panel is determined by your account role</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setMode('email')} className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}><Mail className="w-4 h-4 inline mr-2" />Email</button>
            <button onClick={() => { setMode('phone'); setOtpSent(false); }} className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${mode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}><Phone className="w-4 h-4 inline mr-2" />Phone OTP</button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'email' ? (
              <>
                <div><label className="block text-sm font-medium mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="your@email.com" required /></div></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div></div>
              </>
            ) : (
              <>
                <div><label className="block text-sm font-medium mb-1">Phone</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-11" placeholder="9876543210" required /></div></div>
                {otpSent && <div><label className="block text-sm font-medium mb-1">OTP</label><input type="text" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} className="input-field" placeholder="6-digit OTP" maxLength={6} required /></div>}
              </>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Please wait...' : mode === 'phone' ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Sign In'}<ArrowRight className="w-5 h-5 ml-2" /></button>
          </form>

          <p className="text-center mt-6 text-gray-600">New here? <Link to="/auth/register" className="text-primary-600 font-medium">Create an Account</Link></p>
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
