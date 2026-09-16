import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { MarketRatingInfo, getStarLabel } from '../utils/ratingUtils';

interface StarRatingWidgetProps {
  ratingInfo: MarketRatingInfo;
  onRate: (score: number) => void;
  onClearRating?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  ratingInfo,
  onRate,
  onClearRating,
  size = 'md',
  showBreakdown = false,
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const activeStar = hoveredStar !== null ? hoveredStar : (ratingInfo.userRating || 0);

  return (
    <div className="space-y-3">
      {/* Top Banner: Score, Stars & Community Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-white">
              {ratingInfo.average.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400">/ 5.0</span>
          </div>

          <div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(ratingInfo.average)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              {ratingInfo.count} community reviews
            </p>
          </div>
        </div>

        {ratingInfo.isCommunityFavorite && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>Top Favored</span>
          </span>
        )}
      </div>

      {/* User Interactive Rating Panel */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-200">
            {ratingInfo.userRating ? 'Your Rating' : 'Rate this Market (1-5 Stars)'}
          </span>
          {ratingInfo.userRating && onClearRating && (
            <button
              type="button"
              onClick={onClearRating}
              className="text-[11px] font-medium text-neutral-400 hover:text-rose-400 transition underline underline-offset-2"
            >
              Clear rating
            </button>
          )}
        </div>

        {/* 5-Star Interactive Buttons */}
        <div className="mt-2.5 flex items-center gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= activeStar;
            return (
              <button
                key={star}
                type="button"
                id={`btn-star-rate-${star}`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => onRate(star)}
                className="group relative p-1.5 rounded-lg hover:bg-neutral-800 transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                title={`${star} Star${star > 1 ? 's' : ''}`}
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={`${starSizes[size]} transition-transform group-hover:scale-125 ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                      : 'text-neutral-600 group-hover:text-amber-300'
                  }`}
                />
              </button>
            );
          })}

          <div className="ml-2 text-xs font-medium text-emerald-400 truncate">
            {hoveredStar
              ? getStarLabel(hoveredStar)
              : ratingInfo.userRating
              ? `✓ ${getStarLabel(ratingInfo.userRating)}`
              : ''}
          </div>
        </div>

        <p className="mt-2 text-[11px] text-neutral-400">
          {ratingInfo.userRating
            ? 'Stored in your local browser. You can update your rating anytime.'
            : 'Tap or click stars to help visitors identify popular community spots.'}
        </p>
      </div>

      {/* Breakdown Bar Chart (Optional in modal) */}
      {showBreakdown && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Rating Distribution
          </div>
          {[
            { star: 5, pct: ratingInfo.breakdown.star5 },
            { star: 4, pct: ratingInfo.breakdown.star4 },
            { star: 3, pct: ratingInfo.breakdown.star3 },
            { star: 2, pct: ratingInfo.breakdown.star2 },
            { star: 1, pct: ratingInfo.breakdown.star1 },
          ].map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="w-4 text-right">{star}★</span>
              <div className="h-1.5 flex-1 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-neutral-500 font-mono text-[10px]">{pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
