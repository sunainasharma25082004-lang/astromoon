import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

export default function UserNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    apiFetch('/notifications', {}, token)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useRealtimeData(load, 'notifications', [token]);

  const markAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PATCH' }, token);
    toast.success('All marked as read');
    load();
  };

  const markRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }, token);
    load();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Shop orders & account updates"
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-700 px-3 py-2 rounded-lg hover:bg-violet-50 transition"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          ) : undefined
        }
      />

      <PanelCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-violet-300" />
            </div>
            <p className="text-slate-600 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n: any) => (
              <div
                key={n._id}
                onClick={() => !n.is_read && markRead(n._id)}
                className={`p-5 cursor-pointer transition hover:bg-slate-50/60 ${!n.is_read ? 'bg-violet-50/40' : ''}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-800">{n.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{n.message}</div>
                    <div className="text-xs text-slate-400 mt-1.5">{formatDate(n.createdAt)}</div>
                  </div>
                  {!n.is_read && (
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                  )}
                  {n.is_read && <Check className="w-4 h-4 text-slate-300 shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}