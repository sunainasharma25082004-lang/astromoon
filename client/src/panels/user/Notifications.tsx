import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function UserNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    apiFetch('/notifications', {}, token).then(setNotifications).catch(() => {}).finally(() => setLoading(false));
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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm">Wallet, consultations &amp; updates</p>
          </div>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="text-sm text-sky-600 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Mark all read</button>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 divide-y divide-sky-50">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No notifications yet</div>
        ) : notifications.map((n: any) => (
          <div key={n._id} onClick={() => !n.is_read && markRead(n._id)} className={`p-4 cursor-pointer hover:bg-sky-50/50 ${!n.is_read ? 'bg-sky-50/30' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm">{n.title}</div>
                <div className="text-sm text-gray-600 mt-0.5">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</div>
              </div>
              {!n.is_read && <span className="w-2 h-2 bg-sky-500 rounded-full mt-1" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}