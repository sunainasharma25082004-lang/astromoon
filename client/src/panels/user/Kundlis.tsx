import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

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
      <PageHeader
        icon={FileText}
        title="My Kundlis"
        subtitle="Saved birth charts"
        action={
          <Link
            to="/kundli"
            className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-violet-700 transition shadow-md shadow-violet-200"
          >
            <Plus className="w-4 h-4" /> Generate New
          </Link>
        }
      />

      <PanelCard className="overflow-hidden">
        {kundlis.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-indigo-300" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No kundlis saved yet</p>
            <p className="text-slate-400 text-sm mb-5">Generate your free birth chart and save it here.</p>
            <Link
              to="/kundli"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
            >
              Generate Free Kundli <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {kundlis.map((k: any, i: number) => (
              <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-800">{k.name || 'My Kundli'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {k.birth_place} • {k.birth_date}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">{k.saved_at ? formatDate(k.saved_at) : ''}</div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}