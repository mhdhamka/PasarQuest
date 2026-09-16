import { GamificationProfile, MarketCheckIn } from '../types';

export function getTodayDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(dateKeyStr: string): string {
  const [year, month, day] = dateKeyStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getTodayDateKey(date);
}

/**
 * Derives a streak by analyzing the sequence of check-in dates
 */
export function deriveStreakFromCheckIns(checkIns: MarketCheckIn[]): {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
} {
  if (!checkIns || checkIns.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique dates in YYYY-MM-DD descending
  const uniqueDatesSet = new Set<string>();
  for (const c of checkIns) {
    try {
      const d = new Date(c.timestamp);
      uniqueDatesSet.add(getTodayDateKey(d));
    } catch {
      // ignore
    }
  }

  const sortedDates = Array.from(uniqueDatesSet).sort().reverse();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const mostRecentDate = sortedDates[0];
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey(todayKey);

  // Check if the latest check-in is today or yesterday
  let currentStreak = 0;
  if (mostRecentDate === todayKey || mostRecentDate === yesterdayKey) {
    currentStreak = 1;
    let expectedPrevDate = getYesterdayDateKey(mostRecentDate);

    for (let i = 1; i < sortedDates.length; i++) {
      if (sortedDates[i] === expectedPrevDate) {
        currentStreak++;
        expectedPrevDate = getYesterdayDateKey(expectedPrevDate);
      } else {
        break;
      }
    }
  }

  // Calculate longest historical streak
  let longestStreak = currentStreak;
  let runningStreak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const expected = getYesterdayDateKey(sortedDates[i]);
    if (sortedDates[i + 1] === expected) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, longestStreak),
    lastCheckInDate: mostRecentDate,
  };
}

/**
 * Updates streak when a new check-in is logged
 */
export function recordCheckInStreak(
  profile: GamificationProfile,
  checkInDateKey: string = getTodayDateKey()
): {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string;
  streakIncremented: boolean;
} {
  const currentStreak = profile.currentStreak || 0;
  const longestStreak = profile.longestStreak || 0;
  const lastDate = profile.lastCheckInDate;

  if (!lastDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastCheckInDate: checkInDateKey,
      streakIncremented: true,
    };
  }

  if (lastDate === checkInDateKey) {
    // Already checked in today, maintain today's streak count
    return {
      currentStreak: Math.max(1, currentStreak),
      longestStreak: Math.max(currentStreak, longestStreak, 1),
      lastCheckInDate: checkInDateKey,
      streakIncremented: false,
    };
  }

  const yesterdayKey = getYesterdayDateKey(checkInDateKey);
  if (lastDate === yesterdayKey) {
    // Consecutive day! Increment streak
    const newStreak = (currentStreak > 0 ? currentStreak : 1) + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastCheckInDate: checkInDateKey,
      streakIncremented: true,
    };
  }

  // Streak broken (gap > 1 day) - start fresh at 1
  return {
    currentStreak: 1,
    longestStreak: Math.max(longestStreak, 1),
    lastCheckInDate: checkInDateKey,
    streakIncremented: true,
  };
}

/**
 * Gets live active streak status for display
 */
export function getStreakStatus(profile: GamificationProfile): {
  streak: number;
  isActiveToday: boolean;
  isPendingToday: boolean;
  longestStreak: number;
} {
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey(todayKey);
  const current = profile.currentStreak || 0;
  const longest = profile.longestStreak || current;
  const lastDate = profile.lastCheckInDate;

  if (!lastDate || current === 0) {
    return { streak: 0, isActiveToday: false, isPendingToday: false, longestStreak: longest };
  }

  if (lastDate === todayKey) {
    // Checked in today! Streak is maintained and marked active
    return { streak: current, isActiveToday: true, isPendingToday: false, longestStreak: longest };
  }

  if (lastDate === yesterdayKey) {
    // Checked in yesterday, can keep streak alive with a check-in today!
    return { streak: current, isActiveToday: false, isPendingToday: true, longestStreak: longest };
  }

  // Broken streak (more than 1 day ago)
  return { streak: 0, isActiveToday: false, isPendingToday: false, longestStreak: longest };
}
