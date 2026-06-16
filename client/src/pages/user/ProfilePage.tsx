import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Clock, Save } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    gender: '',
    date_of_birth: '',
    birth_time: '',
    birth_place: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/dashboard" className="text-primary-600 text-sm mb-4 inline-block">← Back to Dashboard</Link>
        <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
        <p className="text-gray-500 mb-8">Complete your birth details for accurate kundli & consultations</p>

        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="input-field pl-11" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="input-field pl-11 bg-gray-50" value={user?.email || ''} disabled />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="input-field pl-11" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="date" className="input-field pl-11" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time of Birth</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="time" className="input-field pl-11" value={form.birth_time} onChange={e => setForm({ ...form, birth_time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Place of Birth</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="input-field pl-11" value={form.birth_place} onChange={e => setForm({ ...form, birth_place: e.target.value })} placeholder="City, State" />
            </div>
          </div>
          {user?.referral_code && (
            <div className="p-4 bg-gold/10 rounded-xl border border-gold/20">
              <p className="text-sm text-gray-600">Your Referral Code</p>
              <p className="text-xl font-bold text-cosmic-purple">{user.referral_code}</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
            <Save className="w-4 h-4 mr-2" />{loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}