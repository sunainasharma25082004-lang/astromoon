import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const STORAGE_KEY = 'celestial_saved_kundlis';

export default function UserKundlis() {
  const [kundlis, setKundlis] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setKundlis(saved ? JSON.parse(saved) : []);
    } catch { setKundlis([]); }
  }, []);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">My Kundlis</h1>
            <p className="text-gray-500 text-sm">Saved birth charts</p>
          </div>
        </div>
        <Link to="/kundli" className="flex items-center gap-1 text-sm bg-sky-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-sky-700">
          <Plus className="w-4 h-4" /> Generate New
        </Link>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100">
        {kundlis.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No kundlis saved yet. <Link to="/kundli" className="text-sky-600 font-medium">Generate your free kundli →</Link>
          </div>
        ) : (
          <div className="divide-y divide-sky-50">
            {kundlis.map((k: any, i: number) => (
              <div key={i} className="p-5 flex justify-between">
                <div>
                  <div className="font-medium text-sm">{k.name || 'My Kundli'}</div>
                  <div className="text-xs text-gray-500">{k.birth_place} • {k.birth_date}</div>
                </div>
                <div className="text-xs text-gray-400">{k.saved_at ? formatDate(k.saved_at) : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}