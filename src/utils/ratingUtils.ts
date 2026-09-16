import { Market } from '../types';

export interface MarketRatingInfo {
  average: number;
  count: number;
  userRating?: number;
  isCommunityFavorite: boolean;
  breakdown: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Computes deterministic community rating combined with user's locally stored rating.
 */
export function getMarketRating(
  market: Market,
  userRating?: number
): MarketRatingInfo {
  const seed = simpleHash(market.id + (market.name || ''));

  // Realistic Malaysian night market base rating (4.2 - 4.9)
  const baseRating = Number((4.2 + (seed % 8) * 0.1).toFixed(1));

  // Base community count influenced by market stall capacity
  const stallFactor = market.total_shop ? Math.floor(market.total_shop * 0.4) : 15;
  const baseCount = 18 + (seed % 65) + stallFactor;

  const hasUserRating = typeof userRating === 'number' && userRating >= 1 && userRating <= 5;
  const count = baseCount + (hasUserRating ? 1 : 0);
  const totalScore = baseRating * baseCount + (hasUserRating ? userRating! : 0);
  const average = Number((totalScore / count).toFixed(1));

  // Percentage distribution calculations
  const p5 = 60 + (seed % 22);
  const p4 = 20 + ((seed >> 2) % 12);
  const p3 = 5 + ((seed >> 4) % 6);
  const p2 = 2 + ((seed >> 6) % 3);
  const p1 = Math.max(1, 100 - (p5 + p4 + p3 + p2));

  return {
    average,
    count,
    userRating: hasUserRating ? userRating : undefined,
    isCommunityFavorite: average >= 4.7 || (hasUserRating && userRating === 5),
    breakdown: {
      star5: p5,
      star4: p4,
      star3: p3,
      star2: p2,
      star1: p1,
    },
  };
}

export function getStarLabel(rating: number): string {
  const labels: Record<number, string> = {
    5: 'Outstanding! Highly Recommended',
    4: 'Very Good & Lively',
    3: 'Good & Satisfactory',
    2: 'Fair',
    1: 'Needs Improvement',
  };

  return labels[rating] || '';
}
