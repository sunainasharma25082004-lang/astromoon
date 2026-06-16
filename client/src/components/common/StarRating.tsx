import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxRating; i++) {
    let fillPercentage = 0;
    if (i <= fullStars) {
      fillPercentage = 100;
    } else if (i === fullStars + 1 && hasHalfStar) {
      fillPercentage = 50;
    }

    stars.push(
      <div
        key={i}
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        onClick={() => interactive && onChange?.(i)}
      >
        {/* Empty Star */}
        <Star className={`${sizes[size]} text-gray-300`} />

        {/* Filled Star */}
        {fillPercentage > 0 && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className={`${sizes[size]} text-amber-400 fill-current`} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5">
      {stars}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
