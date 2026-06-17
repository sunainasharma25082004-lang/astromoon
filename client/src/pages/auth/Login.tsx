import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, User, Shield, Star, LogOut } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { AuthLayout } from '../../components/auth/AuthLayout';

type LoginRole = 'user' | 'astrologer' | 'admin';

const ROLE_LABELS: Record<LoginRole, string> = {
  user: 'User',
  astrologer: 'Astrologer',
  admin: 'Admin',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, sendOtp, signInOtp, signOut, user, isAuthenticated, isInitializing } = useAuth();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const redirectTo = searchParams.get('redirect') || '';
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('user');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '', full_name: '' });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin' || roleParam === 'astrologer' || roleParam === 'user') {
      setSelectedRole(roleParam);
    }
    if (searchParams.get('registered') === '1') {
      setSuccess('Account created! Please sign in with your new user account.');
    }
  }, [searchParams]);

  const roleMismatchMessage = (actual: string, expected: LoginRole) => {
    if (expected === 'user') {
      if (actual === 'astrologer') return 'This email is an Astrologer account. Select "Astrologer" login above, or use a different email for user account.';
      if (actual === 'admin') return 'This email is an Admin account. Select "Admin" login above.';
    }
    if (expected === 'astrologer') {
      if (actual === 'user') return 'This is a regular user account. Apply at Become Astrologer first, or use User login.';
      if (actual === 'admin') return 'This is an Admin account. Use Admin login tab.';
    }
    if (expected === 'admin') {
      return 'This account is not an admin. Use User or Astrologer login, or correct admin credentials.';
    }
    return 'Wrong login type for this account.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signOut();

      let loggedUser;
      if (selectedRole === 'user' && mode === 'phone') {
        if (!otpSent) {
          const phone = form.phone.replace(/\D/g, '').slice(-10);
          if (phone.length !== 10) throw new Error('Enter a valid 10-digit phone number');
          await sendOtp(phone);
          setOtpSent(true);
          setLoading(false);
          return;
        }
        const phone = form.phone.replace(/\D/g, '').slice(-10);
        loggedUser = await signInOtp(phone, form.otp, form.full_name || undefined);
      } else {
        loggedUser = await signIn(form.email.trim(), form.password);
      }

      const role = loggedUser?.role || 'user';

      if (role !== selectedRole) {
        await signOut();
        throw new Error(roleMismatchMessage(role, selectedRole));
      }

      if (selectedRole === 'admin') navigate('/admin');
      else if (selectedRole === 'astrologer') navigate('/astro');
      else if (redirectTo && redirectTo.startsWith('/')) navigate(redirectTo);
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { id: LoginRole; label: string; desc: string; Icon: typeof User; active: string }[] = [
    { id: 'user', label: 'User', desc: 'Shop & dashboard', Icon: User, active: 'border-violet-500 bg-violet-50 text-violet-700' },
    { id: 'astrologer', label: 'Astrologer', desc: 'Astro panel', Icon: Star, active: 'border-amber-500 bg-amber-50 text-amber-800' },
    { id: 'admin', label: 'Admin', desc: 'Shop manager', Icon: Shield, active: 'border-rose-500 bg-rose-50 text-rose-700' },
  ];

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Choose account type, then sign in"
      sideTitle="Your cosmic journey continues"
      sideSubtitle="One email = one account type. Pick the correct login tab for your account."
      sidePoints={['User — shop & orders', 'Astrologer — after admin approval', 'Admin — shop management only']}
    >
      {!isInitializing && isAuthenticated && user && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Logged in as <strong>{user.email}</strong> ({user.role})
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out to switch account
          </button>
        </div>
      )}

      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Login as</p>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map(({ id, label, desc, Icon, active }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setSelectedRole(id); setError(''); setOtpSent(false); }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition ${selectedRole === id ? active : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="font-semibold text-xs">{label}</div>
              <div className="text-[10px] opacity-70 leading-tight">{desc}</div>
            </button>
          ))}
        </div>
        {selectedRole === 'admin' && (
          <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
            Use admin email <strong>admin@celestialguidance.com</strong> with your authorised admin password. Select this Admin tab — not User or Astrologer.
          </p>
        )}
        {selectedRole === 'astrologer' && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
            Only after admin approves your application. Use the email & password admin shared with you.
          </p>
        )}
      </div>

      {selectedRole === 'user' && (
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
          <button type="button" onClick={() => { setMode('email'); setOtpSent(false); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            <Mail className="w-4 h-4 inline mr-1.5" />Email
          </button>
          <button type="button" onClick={() => { setMode('phone'); setOtpSent(false); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            <Phone className="w-4 h-4 inline mr-1.5" />Phone OTP
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(selectedRole !== 'user' || mode === 'email') ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" placeholder="9876543210" required />
              </div>
            </div>
            {otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Full name (new users)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP</label>
                  <input type="text" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl tracking-widest text-center text-lg" placeholder="6-digit OTP" maxLength={6} required />
                </div>
              </>
            )}
          </>
        )}

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 transition disabled:opacity-60">
          {loading ? 'Please wait...' : selectedRole === 'user' && mode === 'phone' && !otpSent ? 'Send OTP' : `Sign in as ${ROLE_LABELS[selectedRole]}`}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {selectedRole === 'user' && (
        <p className="text-center mt-6 text-sm text-slate-500">
          New here? <Link to={redirectTo ? `/auth/register?redirect=${encodeURIComponent(redirectTo)}` : '/auth/register'} className="text-violet-600 font-semibold hover:underline">Create account</Link>
        </p>
      )}
    </AuthLayout>
  );
}