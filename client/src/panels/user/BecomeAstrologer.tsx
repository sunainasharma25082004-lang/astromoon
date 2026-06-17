import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

const inputClass =
  'w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition';

const DRAFT_KEY = 'astrostar_astrologer_apply_draft';

interface Props {
  embedded?: boolean;
  publicMode?: boolean;
}

export default function BecomeAstrologer({ embedded = false, publicMode = false }: Props) {
  const navigate = useNavigate();
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

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setForm(prev => ({ ...prev, ...parsed }));
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.phone && !form.phone) {
      setForm(prev => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user?.phone]);

  const loadApplication = () => {
    if (!token) {
      setApplication(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch('/applications/astrologer/my', {}, token)
      .then((data) => setApplication(data && data.status !== 'rejected' ? data : null))
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  };

  useRealtimeData(loadApplication, 'applications', [token]);

  useEffect(() => {
    if (publicMode || !token) {
      setApplication(null);
      setLoading(false);
    }
  }, [publicMode, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (publicMode || !token) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      toast('Please login to submit your application');
      navigate(`/auth/login?redirect=${encodeURIComponent('/become-astrologer')}`);
      return;
    }

    if (user?.role === 'admin') {
      toast.error('Admin account cannot apply. Please create a separate user account.');
      return;
    }
    if (user?.role === 'astrologer') {
      toast.error('You are already an astrologer. Open Astro Panel from the menu.');
      return;
    }

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
      <PanelCard className="p-10 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">You are already an Astrologer!</h2>
        <p className="text-slate-500 text-sm mt-2">
          Go to your <Link to="/astro" className="text-violet-600 font-medium hover:underline">Astrologer Panel</Link>
        </p>
      </PanelCard>
    );
  }

  if (loading && !publicMode && token) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (application) {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-100', label: 'Under Review' },
      interview_scheduled: { icon: Calendar, color: 'text-blue-700 bg-blue-50 border-blue-100', label: 'Interview Scheduled' },
      approved: { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-700 bg-red-50 border-red-100', label: 'Rejected' },
    };
    const cfg = statusConfig[application.status] || statusConfig.pending;
    const Icon = cfg.icon;

    return (
      <div>
        {!embedded && (
          <PageHeader
            icon={Sparkles}
            title="Become an Astrologer"
            subtitle="Your application status"
          />
        )}
        <PanelCard className="p-6 sm:p-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border mb-6 ${cfg.color}`}>
            <Icon className="w-4 h-4" /> {cfg.label}
          </div>

          {application.status === 'interview_scheduled' && application.interview_date && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm">
              <strong>Interview:</strong> {formatDate(application.interview_date)}
              {application.interview_notes && <p className="text-slate-600 mt-1">{application.interview_notes}</p>}
            </div>
          )}

          {application.status === 'approved' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-4 text-sm">
              <p className="font-semibold text-emerald-800 text-base">Congratulations! Your application is approved.</p>
              <p className="text-emerald-700 mt-2 leading-relaxed">
                Admin will contact you shortly with the next steps to start consulting on Astro Star.
              </p>
              <p className="text-slate-500 text-xs mt-3">Please keep your phone handy — our team will reach out soon.</p>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-sm text-red-700">
              {application.rejection_reason || 'Application not approved. You may re-apply later.'}
            </div>
          )}

          {application.status === 'pending' && (
            <p className="text-slate-600 text-sm">Admin is reviewing your profile. Interview will be scheduled soon. You will get a notification.</p>
          )}

          <div className="mt-6 text-xs text-slate-400 space-y-1">
            <p>Applied: {formatDate(application.createdAt)}</p>
            <p>Experience: {application.experience} yrs • {application.expertise?.join(', ')}</p>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader
          icon={Sparkles}
          title="Become an Astrologer"
          subtitle="Apply now — admin will interview & approve you"
        />
      )}

      <PanelCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800">
            Submit your details — admin will review your application and contact you. Live consultations happen in the mobile app.
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Years of Experience</label>
            <input
              type="number"
              min={0}
              value={form.experience}
              onChange={e => setForm({ ...form, experience: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Expertise (comma separated)</label>
            <input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Languages</label>
            <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              required
              rows={3}
              className={inputClass}
              placeholder="Tell us about your astrology background..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Education / Certifications</label>
            <input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-60 hover:from-violet-700 hover:to-indigo-700 transition shadow-lg shadow-violet-200"
          >
            {submitting ? 'Submitting...' : publicMode || !token ? 'Login & Submit Application' : 'Submit Application'}
          </button>
        </form>
      </PanelCard>
    </div>
  );
}