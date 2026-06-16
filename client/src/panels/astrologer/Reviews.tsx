import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function AstroReviews() {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const astroId = user?.astrologer_profile_id;

  const load = () => {
    if (!astroId) return;
    apiFetch(`/reviews/astrologer/${astroId}`, {}, token).then(setReviews).catch(() => {});
  };

  useRealtimeData(load, 'reviews', [astroId, token]);

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await apiFetch(`/reviews/${id}`, { method: 'DELETE' }, token);
      toast.success('Review removed');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><Star className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm">{reviews.length} client reviews</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-amber-100 divide-y divide-amber-50">
        {reviews.length === 0 ? <div className="p-10 text-center text-gray-500 text-sm">No reviews yet</div> : reviews.map((r: any) => (
          <div key={r._id} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm">{r.user_id?.full_name || 'User'}</span>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-sm">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</div>
                <button onClick={() => deleteReview(r._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete review">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{r.comment}</p>
            <p className="text-xs text-gray-400 mt-2">{formatDate(r.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}