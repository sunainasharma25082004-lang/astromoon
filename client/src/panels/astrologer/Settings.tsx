import { Bell } from 'lucide-react';

export default function AstroSettings() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Notification preferences</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4 max-w-lg">
        {[
          { label: 'New consultation alerts', enabled: true },
          { label: 'Withdrawal updates', enabled: true },
          { label: 'Review notifications', enabled: true },
        ].map(s => (
          <div key={s.label} className="flex justify-between items-center p-4 bg-amber-50/50 rounded-xl">
            <span className="text-sm text-gray-700">{s.label}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${s.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{s.enabled ? 'On' : 'Off'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}