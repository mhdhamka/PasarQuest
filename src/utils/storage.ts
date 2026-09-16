import { Market, ViewMode, GamificationProfile } from '../types';
import { deriveStreakFromCheckIns } from './streak';

const FAVORITES_KEY = 'cpm_favorites_v1';
const USER_MARKETS_KEY = 'cpm_user_markets_v1';
const VIEW_KEY = 'cpm_view_mode_v1';
const RATINGS_KEY = 'cpm_ratings_v1';
const GAMIFICATION_KEY = 'cpm_gamification_profile_v1';

export function getStoredFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveStoredFavorites(favs: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

export function getStoredUserMarkets(): Market[] {
  try {
    const raw = localStorage.getItem(USER_MARKETS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((m) => {
      const lat = Number(m?.location?.latitude);
      const lng = Number(m?.location?.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  } catch {
    return [];
  }
}

export function saveUserMarket(market: Market): void {
  try {
    const current = getStoredUserMarkets();
    const updated = [market, ...current.filter((m) => m.id !== market.id)];
    localStorage.setItem(USER_MARKETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save user market to localStorage', e);
  }
}

export function getStoredViewMode(): ViewMode {
  try {
    const view = localStorage.getItem(VIEW_KEY);
    if (view === 'split' || view === 'list' || view === 'map') return view;
    return 'split';
  } catch {
    return 'split';
  }
}

export function saveStoredViewMode(view: ViewMode): void {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch (e) {
    console.error('Failed to save view mode', e);
  }
}

export function getStoredRatings(): Record<string, number> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const valid: Record<string, number> = {};
    for (const [id, score] of Object.entries(parsed)) {
      const num = Number(score);
      if (Number.isInteger(num) && num >= 1 && num <= 5) {
        valid[id] = num;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export function saveStoredRating(marketId: string, rating: number): void {
  try {
    const ratings = getStoredRatings();
    if (rating >= 1 && rating <= 5) {
      ratings[marketId] = rating;
    } else {
      delete ratings[marketId];
    }
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.error('Failed to save rating to localStorage', e);
  }
}

export function removeStoredRating(marketId: string): void {
  try {
    const ratings = getStoredRatings();
    delete ratings[marketId];
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.error('Failed to remove rating from localStorage', e);
  }
}

export function getStoredGamificationProfile(): GamificationProfile {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const checkIns = Array.isArray(parsed.checkIns) ? parsed.checkIns : [];
      const derived = deriveStreakFromCheckIns(checkIns);

      const currentStreak = typeof parsed.currentStreak === 'number'
        ? parsed.currentStreak
        : derived.currentStreak;
      const longestStreak = typeof parsed.longestStreak === 'number'
        ? parsed.longestStreak
        : Math.max(derived.longestStreak, currentStreak);
      const lastCheckInDate = typeof parsed.lastCheckInDate === 'string'
        ? parsed.lastCheckInDate
        : derived.lastCheckInDate;

      return {
        totalXp: Number(parsed.totalXp) || 0,
        collectedFoods: parsed.collectedFoods || {},
        checkIns,
        unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
        currentStreak,
        longestStreak,
        lastCheckInDate,
      };
    }
  } catch (e) {
    console.error('Failed to parse gamification profile:', e);
  }
  return {
    totalXp: 0,
    collectedFoods: {},
    checkIns: [],
    unlockedBadges: [],
    currentStreak: 0,
    longestStreak: 0,
  };
}

export function saveStoredGamificationProfile(profile: GamificationProfile): void {
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save gamification profile to localStorage', e);
  }
}

