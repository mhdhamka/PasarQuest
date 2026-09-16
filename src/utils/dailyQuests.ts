import { DailyQuest, MarketCheckIn } from '../types';

const QUEST_CLAIMS_PREFIX = 'cpm_daily_quest_claims_';

/**
 * Returns YYYY-MM-DD for the user's local date
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the set of claimed quest IDs for today
 */
export function getTodayClaimedQuestIds(): Set<string> {
  const key = `${QUEST_CLAIMS_PREFIX}${getTodayDateKey()}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Save claimed quest IDs for today
 */
export function saveTodayClaimedQuestId(questId: string): void {
  const claimed = getTodayClaimedQuestIds();
  claimed.add(questId);
  const key = `${QUEST_CLAIMS_PREFIX}${getTodayDateKey()}`;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(claimed)));
  } catch (e) {
    console.error('Failed to save claimed quest to localStorage', e);
  }
}

/**
 * Calculates current progress for today's daily quests
 */
export function computeDailyQuests(checkIns: MarketCheckIn[]): DailyQuest[] {
  const todayKey = getTodayDateKey();
  const claimedIds = getTodayClaimedQuestIds();

  // Filter check-ins done today
  const todayCheckIns = checkIns.filter((c) => {
    try {
      const d = new Date(c.timestamp);
      const cYear = d.getFullYear();
      const cMonth = String(d.getMonth() + 1).padStart(2, '0');
      const cDay = String(d.getDate()).padStart(2, '0');
      return `${cYear}-${cMonth}-${cDay}` === todayKey;
    } catch {
      return false;
    }
  });

  const uniqueTodayMarkets = new Set(todayCheckIns.map((c) => c.marketId));
  const uniqueTodayStates = new Set(todayCheckIns.map((c) => c.state.trim().toLowerCase()));

  // Count evening visits (after 18:00 / 6 PM)
  const eveningVisits = todayCheckIns.filter((c) => {
    try {
      const hour = new Date(c.timestamp).getHours();
      return hour >= 18;
    } catch {
      return false;
    }
  }).length;

  const questDefinitions: Array<Omit<DailyQuest, 'current' | 'completed' | 'claimed'>> = [
    {
      id: `quest-scout-${todayKey}`,
      title: 'Night Market Scout',
      description: 'Check in at 1 night market today',
      icon: '🎯',
      target: 1,
      xpReward: 100,
      type: 'check_in_count',
    },
    {
      id: `quest-hopper-${todayKey}`,
      title: 'Pasar Hopper',
      description: 'Check in at 2 different night markets today',
      icon: '🍢',
      target: 2,
      xpReward: 180,
      type: 'check_in_count',
    },
    {
      id: `quest-states-${todayKey}`,
      title: 'Cross-State Gourmet',
      description: 'Visit and check in at markets in 2 different states',
      icon: '🗺️',
      target: 2,
      xpReward: 250,
      type: 'different_states',
    },
    {
      id: `quest-evening-${todayKey}`,
      title: 'Twilight Stroller',
      description: 'Check in at a night market after 6:00 PM',
      icon: '🌙',
      target: 1,
      xpReward: 120,
      type: 'evening_visit',
    },
  ];

  return questDefinitions.map((def) => {
    let current = 0;
    if (def.type === 'check_in_count') {
      current = Math.min(def.target, uniqueTodayMarkets.size);
    } else if (def.type === 'different_states') {
      current = Math.min(def.target, uniqueTodayStates.size);
    } else if (def.type === 'evening_visit') {
      current = Math.min(def.target, eveningVisits);
    }

    const completed = current >= def.target;
    const claimed = claimedIds.has(def.id);

    return {
      ...def,
      current,
      completed,
      claimed,
    };
  });
}

/**
 * Returns formatted time remaining until midnight
 */
export function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
