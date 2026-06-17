import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { APP_NAME } from '../../constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerAccount, signOut } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/auth/login';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.agreeTerms) {
      setError('Please accept the Terms & Privacy Policy');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const phone = form.phone.replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await signOut();
      await registerAccount(form.email.trim(), form.password, form.full_name.trim(), { phone });
      const loginUrl = redirectTo.startsWith('/auth/login')
        ? `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}registered=1`
        : `/auth/login?registered=1&redirect=${encodeURIComponent(redirectTo)}`;
      navigate(loginUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One email & one phone = one account only"
      sideTitle={`Join ${APP_NAME}`}
      sideSubtitle="Shop spiritual products, save favourite astrologers, and manage everything from your dashboard."
      sidePoints={['Free kundli & horoscope tools', 'Track shop orders easily', 'Apply to become an astrologer']}
    >
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" placeholder="Your full name" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" placeholder="your@email.com" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" placeholder="9876543210" required />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cannot be used on multiple accounts</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" minLength={6} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" required />
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.agreeTerms} onChange={e => setForm({ ...form, agreeTerms: e.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
          <span className="text-sm text-slate-600">
            I agree to the <Link to="/terms" className="text-violet-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
          </span>
        </label>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 transition disabled:opacity-60">
          {loading ? 'Creating account...' : 'Create Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-slate-500">
        Already have an account? <Link to="/auth/login" className="text-violet-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}