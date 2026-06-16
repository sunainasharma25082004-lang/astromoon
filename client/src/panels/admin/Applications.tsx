import { useEffect, useState } from 'react';
import { UserCheck, Calendar, Check, X, Key } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function AdminApplications() {
  const { token } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [password, setPassword] = useState('astro1234');
  const [loading, setLoading] = useState(false);
  const [approvedCreds, setApprovedCreds] = useState<{ name: string; login_id: string; password: string } | null>(null);

  const load = () => {
    const path = filter === 'all' ? '/admin/applications' : `/admin/applications?status=${filter}`;
    apiFetch(path, {}, token).then(setApps).catch(() => {});
  };

  useRealtimeData(load, 'applications', [token, filter]);

  const scheduleInterview = async (id: string) => {
    setLoading(true);
    try {
      await apiFetch(`/admin/applications/${id}/interview`, {
        method: 'PATCH',
        body: JSON.stringify({ interview_date: interviewDate, interview_notes: interviewNotes }),
      }, token);
      toast.success('Interview scheduled');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const approve = async (id: string) => {
    if (!password || password.length < 6) {
      toast.error('Set a password (min 6 chars) for astrologer login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/applications/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ password, chat_price: 20, call_price: 30, video_price: 50 }),
      }, token);
      setApprovedCreds({
        name: selected?.full_name || 'Astrologer',
        login_id: res.login_id || res.login_email,
        password,
      });
      toast.success('Approved! Share login credentials with the astrologer.');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const reject = async (id: string) => {
    const reason = prompt('Rejection reason?') || 'Not selected';
    await apiFetch(`/admin/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }, token);
    toast.success('Application rejected');
    load();
  };

  return (
    <div>
      {approvedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-emerald-600/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-emerald-400 mb-1">Astrologer Approved</h3>
            <p className="text-sm text-slate-400 mb-4">Share these login details with <strong className="text-white">{approvedCreds.name}</strong></p>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <p className="text-slate-500 text-xs mb-1">Login ID (Email)</p>
                <p className="text-white font-mono">{approvedCreds.login_id}</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <p className="text-slate-500 text-xs mb-1">Password</p>
                <p className="text-white font-mono">{approvedCreds.password}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">They login at /auth/login → choose Astrologer → Astro Panel</p>
            <button onClick={() => setApprovedCreds(null)} className="mt-4 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium">Done</button>
          </div>
        </div>
      )}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 text-purple-400 rounded-xl flex items-center justify-center border border-slate-700"><UserCheck className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Astrologer Applications</h1>
            <p className="text-slate-400 text-sm">Review, interview &amp; approve new astrologers</p>
          </div>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
          <option value="pending">Pending</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 max-h-[70vh] overflow-auto">
          {apps.length === 0 ? <div className="p-10 text-center text-slate-500">No applications</div> : apps.map((a: any) => (
            <button key={a._id} onClick={() => setSelected(a)} className={`w-full text-left p-4 hover:bg-slate-950 transition ${selected?._id === a._id ? 'bg-slate-950' : ''}`}>
              <div className="font-medium text-white text-sm">{a.full_name}</div>
              <div className="text-xs text-slate-500">{a.email} • {a.experience} yrs • <span className="capitalize">{a.status}</span></div>
              <div className="text-xs text-slate-600 mt-1">{formatDate(a.createdAt)}</div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white">{selected.full_name}</h3>
            <p className="text-sm text-slate-400">{selected.bio || 'No bio'}</p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Expertise: {selected.expertise?.join(', ')}</p>
              <p>Languages: {selected.languages?.join(', ')}</p>
              <p>Education: {selected.education || '—'}</p>
              <p>Phone: {selected.phone || '—'}</p>
            </div>

            {selected.status === 'pending' && (
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-sm text-slate-300 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule Interview</p>
                <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                <textarea value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)} placeholder="Interview notes / meeting link..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white h-20" />
                <button onClick={() => scheduleInterview(selected._id)} disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium">Schedule Interview</button>
              </div>
            )}

            {(selected.status === 'pending' || selected.status === 'interview_scheduled') && (
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-sm text-slate-300 font-medium flex items-center gap-2"><Key className="w-4 h-4" /> Approve &amp; Set Login Password</p>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Astrologer panel password" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                <p className="text-xs text-slate-500">User will login with their email + this password at /auth/login → Astro Panel</p>
                <div className="flex gap-2">
                  <button onClick={() => approve(selected._id)} disabled={loading} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Approve</button>
                  <button onClick={() => reject(selected._id)} className="flex-1 py-2.5 bg-red-600/80 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"><X className="w-4 h-4" /> Reject</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">Select an application to review</div>
        )}
      </div>
    </div>
  );
}