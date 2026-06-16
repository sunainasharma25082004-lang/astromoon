import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

export default function BecomeAstrologer() {
  const { user, token } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    experience: '',
    expertise: 'Vedic Astrology, Kundli',
    languages: 'Hindi, English',
    bio: '',
    education: '',
    phone: user?.phone || '',
  });

  const loadApplication = () => {
    if (!token) return;
    apiFetch('/applications/astrologer/my', {}, token)
      .then(setApplication)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useRealtimeData(loadApplication, 'applications', [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiFetch('/applications/astrologer', {
        method: 'POST',
        body: JSON.stringify({
          experience: parseInt(form.experience) || 0,
          expertise: form.expertise.split(',').map(s => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          bio: form.bio,
          education: form.education,
          phone: form.phone,
        }),
      }, token);
      setApplication(data.application);
      toast.success('Application submitted! Admin will review and schedule interview.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role === 'astrologer') {
    return (
      <div className="bg-white rounded-2xl border border-sky-100 p-10 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">You are already an Astrologer!</h2>
        <p className="text-gray-500 text-sm mt-2">Go to your <a href="/astro" className="text-sky-600 font-medium">Astrologer Panel</a></p>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  if (application) {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Under Review' },
      interview_scheduled: { icon: Calendar, color: 'text-blue-600 bg-blue-50', label: 'Interview Scheduled' },
      approved: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', label: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejected' },
    };
    const cfg = statusConfig[application.status] || statusConfig.pending;
    const Icon = cfg.icon;

    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Become an Astrologer</h1>
            <p className="text-gray-500 text-sm">Your application status</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-sky-100 p-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${cfg.color}`}>
            <Icon className="w-4 h-4" /> {cfg.label}
          </div>

          {application.status === 'interview_scheduled' && application.interview_date && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm">
              <strong>Interview:</strong> {formatDate(application.interview_date)}
              {application.interview_notes && <p className="text-gray-600 mt-1">{application.interview_notes}</p>}
            </div>
          )}

          {application.status === 'approved' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 text-sm">
              <p className="font-semibold text-emerald-800">Congratulations! You are approved as an Astrologer.</p>
              <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-100 space-y-1">
                <p className="text-gray-600"><span className="text-gray-500">Login ID:</span> <strong>{application.email}</strong></p>
                <p className="text-gray-600"><span className="text-gray-500">Password:</span> <strong>Set by admin</strong> (check your notification or contact admin)</p>
              </div>
              <p className="text-gray-500 text-xs mt-2">Use these credentials at login → choose Astrologer → you will enter the Astro Panel.</p>
              <a href="/auth/login?role=astrologer" className="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium">Login to Astro Panel</a>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-sm text-red-700">
              {application.rejection_reason || 'Application not approved. You may re-apply later.'}
            </div>
          )}

          {application.status === 'pending' && (
            <p className="text-gray-600 text-sm">Admin is reviewing your profile. Interview will be scheduled soon. You will get a notification.</p>
          )}

          <div className="mt-6 text-xs text-gray-400 space-y-1">
            <p>Applied: {formatDate(application.createdAt)}</p>
            <p>Experience: {application.experience} yrs • {application.expertise?.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Become an Astrologer</h1>
          <p className="text-gray-500 text-sm">Apply now — admin will interview &amp; approve you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-sky-100 p-6 space-y-4 max-w-lg">
        <div className="bg-sky-50 rounded-xl p-4 text-sm text-sky-800">
          After approval, admin will give you login credentials for the <strong>Astrologer Panel</strong>. Wallet payments stay in demo mode.
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Years of Experience</label>
          <input type="number" min={0} value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} required className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Expertise (comma separated)</label>
          <input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Languages</label>
          <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} required rows={3} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" placeholder="Tell us about your astrology background..." />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Education / Certifications</label>
          <input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm" />
        </div>

        <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-60">
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}