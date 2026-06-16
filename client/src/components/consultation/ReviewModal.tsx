import { useState } from 'react';
import { Star } from 'lucide-react';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

interface Props {
  astrologerId: string;
  astrologerName: string;
  consultationId: string;
  consultationType: 'chat' | 'call' | 'video';
  token: string;
  onClose: () => void;
}

export default function ReviewModal({ astrologerId, astrologerName, consultationId, consultationType, token, onClose }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!comment.trim()) {
      toast.error('Please write a short review');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          astrologer_id: astrologerId,
          consultation_id: consultationId,
          rating,
          comment: comment.trim(),
          consultation_type: consultationType,
        }),
      }, token);
      toast.success('Thank you for your review!');
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold mb-1">Rate your session</h2>
        <p className="text-gray-500 text-sm mb-5">How was your {consultationType} with {astrologerName}?</p>
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setRating(n)} className={`text-3xl transition ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (required)..."
          className="w-full border rounded-xl p-4 text-sm h-24 mb-4 focus:outline-none focus:border-amber-400"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border text-sm font-medium">Skip</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}