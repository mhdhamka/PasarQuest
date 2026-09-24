import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, XpGainEvent } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MarketCard } from './components/MarketCard';
import { MarketMap } from './components/MarketMap';
import { MarketDetailModal } from './components/MarketDetailModal';
import { SuggestMarketModal } from './components/SuggestMarketModal';
import { FilterDrawer } from './components/FilterDrawer';
import { BusiestDaysChart } from './components/BusiestDaysChart';
import { AutoLocationPrompt } from './components/AutoLocationPrompt';
import { PasarDexModal } from './components/PasarDexModal';
import { CheckInModal } from './components/CheckInModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getAllMarkets } from './data/loadMarkets';
import {
  Market,
  FilterState,
  ViewMode,
  UserCoordinates,
  GamificationProfile,
  CollectibleFood,
} from './types';
import { filterAndSortMarkets } from './utils/marketUtils';
import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredViewMode,
  saveStoredViewMode,
  getStoredRatings,
  saveStoredRating,
  removeStoredRating,
  getStoredGamificationProfile,
  saveStoredGamificationProfile,
} from './utils/storage';
import {
  pickRandomDelicacy,
  BADGE_DEFINITIONS,
  COLLECTIBLE_FOODS,
  calculateLevel,
} from './data/pasarDexData';
import {
  playCheckInDing,
  playBadgeChime,
  playLevelUpFanfare,
} from './utils/audioFeedback';
import { computeDailyQuests } from './utils/dailyQuests';
import { getStreakStatus, recordCheckInStreak } from './utils/streak';
import { Frown, AlertCircle, Flame } from 'lucide-react';

export default function App() {
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);
  const [showAutoLocationPrompt, setShowAutoLocationPrompt] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('cpm_auto_location_dismissed');
    } catch {
      return true;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [detailModalMarket, setDetailModalMarket] = useState<Market | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gamification: Pasar Dex & Passport States
  const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile>(() =>
    getStoredGamificationProfile()
  );
  const [isPasarDexOpen, setIsPasarDexOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInMarket, setCheckInMarket] = useState<Market | null>(null);
  const [checkInGainedXp, setCheckInGainedXp] = useState(0);
  const [checkInDroppedFood, setCheckInDroppedFood] = useState<CollectibleFood | null>(null);
  const [checkInIsFirstTime, setCheckInIsFirstTime] = useState(false);
  const [checkInNewBadges, setCheckInNewBadges] = useState<string[]>([]);
  const [checkInLeveledUp, setCheckInLeveledUp] = useState(false);
  const [checkInNewLevel, setCheckInNewLevel] = useState<{ level: number; title: string } | null>(null);
  const [checkInStreakCount, setCheckInStreakCount] = useState<number>(0);
  const [checkInStreakIncremented, setCheckInStreakIncremented] = useState<boolean>(false);
  const [recentXpGain, setRecentXpGain] = useState<XpGainEvent | null>(null);

  const currentLevelInfo = useMemo(
    () => calculateLevel(gamificationProfile.totalXp),
    [gamificationProfile.totalXp]
  );
  const xpNeededForNextLevel = Math.max(0, currentLevelInfo.nextLevelXp - gamificationProfile.totalXp);

  const streakStatus = useMemo(
    () => getStreakStatus(gamificationProfile),
    [gamificationProfile]
  );

  const dailyQuestsSummary = useMemo(() => {
    const quests = computeDailyQuests(gamificationProfile.checkIns);
    const readyToClaim = quests.filter((q) => q.completed && !q.claimed).length;
    return { quests, readyToClaim };
  }, [gamificationProfile.checkIns]);

  const [filters, setFilters] = useState<FilterState>({
    state: 'All States',
    day: 'all',
    openNow: false,
    food: 'all',
    hasToilet: false,
    hasSurau: false,
    hasParking: false,
    hasAccessibleParking: false,
    favoritesOnly: false,
    minRating: 0,
    sortBy: 'smart',
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2400);
  }, []);

  const triggerLocationDetection = useCallback((isAutomatic = false) => {
    if (!navigator.geolocation) {
      if (!isAutomatic) {
        setLocationError('Your browser does not support geolocation functionality.');
      }
      setShowAutoLocationPrompt(false);
      return;
    }

    setIsLocating(true);
    if (!isAutomatic) {
      setLocationError(null);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position?.coords?.latitude);
        const lng = Number(position?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          setIsLocating(false);
          if (!isAutomatic) {
            setLocationError('Invalid coordinates received from GPS.');
          }
          return;
        }
        const coords: UserCoordinates = { lat, lng };
        setUserLocation(coords);
        setIsLocating(false);
        setShowAutoLocationPrompt(false);
        try {
          sessionStorage.setItem('cpm_auto_location_dismissed', 'true');
        } catch {
          // ignore
        }
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
        showToast(
          isAutomatic
            ? 'Location detected! Night markets sorted by nearest distance.'
            : 'Location detected successfully! Sorting by nearest distance.'
        );
      },
      (error) => {
        setIsLocating(false);
        if (!isAutomatic) {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError('Location permission denied by user.');
          } else {
            setLocationError('Failed to retrieve precise location.');
          }
        } else {
          // On automatic attempt, if user denied or dismissed native browser prompt, close banner cleanly
          if (error.code === error.PERMISSION_DENIED) {
            setShowAutoLocationPrompt(false);
            try {
              sessionStorage.setItem('cpm_auto_location_dismissed', 'true');
            } catch {
              // ignore
            }
          }
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [showToast]);

  useEffect(() => {
    setAllMarkets(getAllMarkets());
    setFavorites(getStoredFavorites());
    setUserRatings(getStoredRatings());
    setViewMode(getStoredViewMode());

    // Auto-location on first load:
    // Prompt & detect location immediately to set coordinates and sort markets by distance
    const isDismissed = (() => {
      try {
        return sessionStorage.getItem('cpm_auto_location_dismissed') === 'true';
      } catch {
        return false;
      }
    })();

    if (navigator.geolocation && !isDismissed) {
      triggerLocationDetection(true);
    }
  }, [triggerLocationDetection]);

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    saveStoredViewMode(newMode);
  };

  const handleToggleFavorite = (marketId: string) => {
    setFavorites((prev) => {
      const next = new Set<string>(prev);
      if (next.has(marketId)) {
        next.delete(marketId);
        showToast('Removed from favorites.');
      } else {
        next.add(marketId);
        showToast('Saved to favorites!');
      }
      saveStoredFavorites(next);
      return next;
    });
  };

  const handleRateMarket = useCallback(
    (marketId: string, rating: number) => {
      setUserRatings((prev) => {
        const next = { ...prev, [marketId]: rating };
        saveStoredRating(marketId, rating);
        return next;
      });
      showToast(`Rated ${rating}★ successfully!`);
    },
    [showToast]
  );

  const handleClearRating = useCallback(
    (marketId: string) => {
      setUserRatings((prev) => {
        const next = { ...prev };
        delete next[marketId];
        removeStoredRating(marketId);
        return next;
      });
      showToast('Rating cleared.');
    },
    [showToast]
  );

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters({
      state: 'All States',
      day: 'all',
      openNow: false,
      food: 'all',
      hasToilet: false,
      hasSurau: false,
      hasParking: false,
      hasAccessibleParking: false,
      favoritesOnly: false,
      minRating: 0,
      sortBy: 'smart',
    });
    setSearchQuery('');
    showToast('Filters have been cleared.');
  };

  const handleRequestLocation = () => {
    triggerLocationDetection(false);
  };

  const handleDismissAutoLocationPrompt = () => {
    setShowAutoLocationPrompt(false);
    try {
      sessionStorage.setItem('cpm_auto_location_dismissed', 'true');
    } catch (e) {
      // ignore
    }
    showToast('Browsing all markets with default sorting.');
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setFilters((prev) => ({ ...prev, sortBy: 'smart' }));
    showToast('GPS location cleared.');
  };

  const handleMarketAdded = (newMarket: Market) => {
    setAllMarkets((prev) => [newMarket, ...prev]);
    setSelectedMarket(newMarket);
    showToast('Your night market was added successfully!');
  };

  const handleCheckIn = useCallback(
    (market: Market) => {
      const prevProfile = getStoredGamificationProfile();
      const prevLevel = calculateLevel(prevProfile.totalXp).level;
      const isFirstVisit = !prevProfile.checkIns.some((c) => c.marketId === market.id);

      // Base XP + first visit bonus
      let gainedXp = isFirstVisit ? 150 : 80;

      // Street food roll
      const dropped = pickRandomDelicacy(market.name);
      gainedXp += dropped.xpValue;

      // Update food collection
      const nextCollected = { ...prevProfile.collectedFoods };
      if (nextCollected[dropped.id]) {
        nextCollected[dropped.id] = {
          ...nextCollected[dropped.id],
          count: nextCollected[dropped.id].count + 1,
        };
      } else {
        nextCollected[dropped.id] = {
          foodId: dropped.id,
          discoveredAt: new Date().toISOString(),
          marketId: market.id,
          marketName: market.name,
          count: 1,
        };
      }

      // Add Check-In record
      const newCheckIn = {
        marketId: market.id,
        marketName: market.name,
        state: market.state,
        district: market.district || '',
        timestamp: new Date().toISOString(),
        dayOfWeek: new Date().getDay(),
      };
      const nextCheckIns = [newCheckIn, ...prevProfile.checkIns];

      // Calculate badges
      const unlockedBadges = new Set(prevProfile.unlockedBadges);
      const newlyEarnedBadges: string[] = [];

      const grantBadge = (badgeId: string, badgeTitle: string) => {
        if (!unlockedBadges.has(badgeId)) {
          unlockedBadges.add(badgeId);
          newlyEarnedBadges.push(badgeTitle);
          gainedXp += 100; // Bonus XP for badge
        }
      };

      if (nextCheckIns.length >= 1) {
        grantBadge('first-checkin', 'Pasar Rookie');
      }

      const uniqueMarketIds = new Set(nextCheckIns.map((c) => c.marketId));
      if (uniqueMarketIds.size >= 3) {
        grantBadge('market-hunter-3', 'Stall Hopper');
      }
      if (uniqueMarketIds.size >= 10) {
        grantBadge('market-master-10', 'Pasar Explorer King');
      }

      const uniqueFoodCount = Object.keys(nextCollected).length;
      if (uniqueFoodCount >= 1) {
        grantBadge('foodie-first-dish', 'Street Food Taster');
      }
      if (uniqueFoodCount >= 5) {
        grantBadge('foodie-collector-5', 'Gourmet Wanderer');
      }
      if (dropped.rarity === 'rare' || dropped.rarity === 'legendary') {
        grantBadge('foodie-rare-find', 'Treasure Hunter');
      }
      if (uniqueFoodCount >= COLLECTIBLE_FOODS.length) {
        grantBadge('full-pasardex', 'Grand Pasar Master');
      }

      const uniqueStates = new Set(nextCheckIns.map((c) => c.state));
      const hasKL = nextCheckIns.some((c) => c.state.toLowerCase().includes('kuala lumpur'));
      const hasSelangor = nextCheckIns.some((c) => c.state.toLowerCase().includes('selangor'));
      if (hasKL && hasSelangor) {
        grantBadge('klang-valley-badge', 'Klang Valley Night Owl');
      }
      if (uniqueStates.size >= 3) {
        grantBadge('state-traveler', 'Peninsular Explorer');
      }

      // Record daily check-in streak
      const streakResult = recordCheckInStreak(prevProfile);
      if (streakResult.currentStreak >= 3) {
        grantBadge('streak-3', 'Flame Keeper');
      }
      if (streakResult.currentStreak >= 7) {
        grantBadge('streak-7', 'Pasar Devotee');
      }

      const updatedProfile: GamificationProfile = {
        totalXp: prevProfile.totalXp + gainedXp,
        collectedFoods: nextCollected,
        checkIns: nextCheckIns,
        unlockedBadges: Array.from(unlockedBadges),
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        lastCheckInDate: streakResult.lastCheckInDate,
      };

      const nextLevelInfo = calculateLevel(updatedProfile.totalXp);
      const leveledUp = nextLevelInfo.level > prevLevel;

      saveStoredGamificationProfile(updatedProfile);
      setGamificationProfile(updatedProfile);

      // Web Audio API subtle browser-based audio feedback:
      // 1. Light 'ding' for checking in
      playCheckInDing();

      // 2. 'Level-up' sound for leveling up in the Pasar Dex
      if (leveledUp) {
        setTimeout(() => {
          playLevelUpFanfare();
        }, 260);
      } else if (newlyEarnedBadges.length > 0) {
        // 3. Magical chime for unlocking new badges
        setTimeout(() => {
          playBadgeChime();
        }, 260);
      }

      // Trigger floating XP visual animation over Pasar Dex button
      const xpEvent: XpGainEvent = { id: Date.now(), amount: gainedXp };
      setRecentXpGain(xpEvent);
      setTimeout(() => {
        setRecentXpGain((curr) => (curr?.id === xpEvent.id ? null : curr));
      }, 2600);

      // Trigger Celebration Modal
      setCheckInMarket(market);
      setCheckInGainedXp(gainedXp);
      setCheckInDroppedFood(dropped);
      setCheckInIsFirstTime(isFirstVisit);
      setCheckInNewBadges(newlyEarnedBadges);
      setCheckInLeveledUp(leveledUp);
      setCheckInNewLevel(leveledUp ? { level: nextLevelInfo.level, title: nextLevelInfo.title } : null);
      setCheckInStreakCount(streakResult.currentStreak);
      setCheckInStreakIncremented(streakResult.streakIncremented);
      setIsCheckInModalOpen(true);

      const streakNote = streakResult.currentStreak > 1 ? ` • 🔥 ${streakResult.currentStreak}-Day Streak!` : '';
      showToast(`Passport Stamped! +${gainedXp} XP & unlocked ${dropped.name}${streakNote}`);
    },
    [showToast]
  );

  const handleClaimDailyQuest = useCallback(
    (xpReward: number, questTitle: string) => {
      const prevProfile = getStoredGamificationProfile();
      const prevLevel = calculateLevel(prevProfile.totalXp).level;

      const updatedProfile: GamificationProfile = {
        ...prevProfile,
        totalXp: prevProfile.totalXp + xpReward,
      };

      const nextLevelInfo = calculateLevel(updatedProfile.totalXp);
      const leveledUp = nextLevelInfo.level > prevLevel;

      saveStoredGamificationProfile(updatedProfile);
      setGamificationProfile(updatedProfile);

      // Trigger floating XP animation
      const xpEvent: XpGainEvent = { id: Date.now(), amount: xpReward };
      setRecentXpGain(xpEvent);
      setTimeout(() => {
        setRecentXpGain((curr) => (curr?.id === xpEvent.id ? null : curr));
      }, 2600);

      if (leveledUp) {
        setTimeout(() => playLevelUpFanfare(), 300);
      }

      showToast(`Quest Complete: ${questTitle}! +${xpReward} Bonus XP`);
    },
    [showToast]
  );

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of allMarkets) {
      counts[m.state] = (counts[m.state] || 0) + 1;
    }
    return counts;
  }, [allMarkets]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.hasToilet) count++;
    if (filters.hasSurau) count++;
    if (filters.hasParking) count++;
    if (filters.hasAccessibleParking) count++;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.sortBy !== 'smart') count++;
    return count;
  }, [filters]);

  const { markets: displayedMarkets, totalFound } = useMemo(() => {
    return filterAndSortMarkets(
      allMarkets,
      filters,
      searchQuery,
      userLocation,
      favorites,
      userRatings
    );
  }, [allMarkets, filters, searchQuery, userLocation, favorites, userRatings]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-neutral-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full border border-emerald-500/50 bg-neutral-900/95 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <Header
        favoritesCount={favorites.size}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavorites={() =>
          handleFilterChange({ favoritesOnly: !filters.favoritesOnly })
        }
        onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
        totalMarkets={allMarkets.length}
        gamificationProfile={gamificationProfile}
        onOpenPasarDex={() => setIsPasarDexOpen(true)}
        recentXpGain={recentXpGain}
      />

      {/* Auto-Location Prompt Banner on First Load */}
      <AutoLocationPrompt
        isOpen={showAutoLocationPrompt && !userLocation}
        isLocating={isLocating}
        onEnableLocation={() => triggerLocationDetection(false)}
        onDismiss={handleDismissAutoLocationPrompt}
      />

      {/* Hero Search, State, Day & Food Cockpit */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        userLocation={userLocation}
        isLocating={isLocating}
        onRequestLocation={handleRequestLocation}
        onClearLocation={handleClearLocation}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        stateCounts={stateCounts}
      />

      {/* Location Error alert if any */}
      {locationError && (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 w-full">
          <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              onClick={() => setLocationError(null)}
              className="text-xs text-rose-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6">
        {/* Results summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-200">
              {totalFound} {totalFound === 1 ? 'market found' : 'markets found'}
            </span>
            {filters.state !== 'All States' && (
              <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[11px] text-emerald-400">
                {filters.state}
              </span>
            )}
            {filters.favoritesOnly && (
              <span className="rounded bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[11px] text-rose-300">
                Favorites Only
              </span>
            )}
            {Boolean(filters.minRating && filters.minRating > 0) && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] text-amber-300">
                <span>≥ {filters.minRating}★ Rating</span>
                <button
                  onClick={() => handleFilterChange({ minRating: 0 })}
                  className="hover:text-white"
                  title="Clear min rating"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-analytics-visibility"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 transition hover:border-emerald-500/50 hover:bg-neutral-850"
            >
              <span>
                {showAnalytics ? 'Hide Days Chart' : 'Show Busiest Days Chart'}
              </span>
            </button>

            <span className="hidden sm:inline text-[11px] text-neutral-400">
              {filters.sortBy === 'distance' && userLocation
                ? filters.travelMode === 'walking'
                  ? 'Nearest Walking Time & Footpath Distance'
                  : 'Nearest Driving Time & Road Distance'
                : filters.sortBy === 'rating'
                ? 'Highest Community Rating ⭐'
                : filters.sortBy === 'shops'
                ? 'Most Stalls'
                : filters.sortBy === 'name-asc'
                ? 'Name (A - Z)'
                : 'Smart (Open & Nearest)'}
            </span>
          </div>
        </div>

        {/* Busiest Days Chart Component */}
        {showAnalytics && (
          <BusiestDaysChart
            markets={displayedMarkets}
            allMarkets={allMarkets}
            selectedDay={filters.day}
            onSelectDay={(day) => handleFilterChange({ day })}
          />
        )}

        {/* View Mode Switch Logic with Subtle Fade-In Transition */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-6 xl:col-span-6 space-y-3.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                  {displayedMarkets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
                      <Frown className="h-10 w-10 text-neutral-500 mb-3" />
                      <h3 className="font-display text-base font-bold text-white">
                        No Night Markets Found
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 max-w-xs">
                        No night markets match your criteria. Try adjusting your search query, selecting another state or day, or clearing filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {displayedMarkets.map((market, index) => (
                        <MarketCard
                          key={market.id}
                          index={index}
                          market={market}
                          isSelected={selectedMarket?.id === market.id}
                          onSelect={(m) => setSelectedMarket(m)}
                          onOpenDetails={(m) => setDetailModalMarket(m)}
                          isFavorite={favorites.has(market.id)}
                          onToggleFavorite={handleToggleFavorite}
                          userRating={userRatings[market.id]}
                          onRate={handleRateMarket}
                          userLocation={userLocation}
                          travelMode={filters.travelMode || 'driving'}
                          isCheckedIn={gamificationProfile.checkIns.some((c) => c.marketId === market.id)}
                          onCheckIn={handleCheckIn}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-[calc(100vh-230px)] sticky top-20 rounded-xl overflow-hidden shadow-2xl">
                  <MarketMap
                    markets={displayedMarkets}
                    selectedMarket={selectedMarket}
                    onSelectMarket={(m) => setSelectedMarket(m)}
                    userLocation={userLocation}
                    onOpenDetails={(m) => setDetailModalMarket(m)}
                    userRatings={userRatings}
                    travelMode={filters.travelMode || 'driving'}
                  />
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMarkets.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
                    <Frown className="h-10 w-10 text-neutral-500 mb-3" />
                    <h3 className="font-display text-base font-bold text-white">
                      No Night Markets Found
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 max-w-xs">
                      No night markets match your criteria. Try adjusting your search query, selecting another state or day, or clearing filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {displayedMarkets.map((market, index) => (
                      <MarketCard
                        key={market.id}
                        index={index}
                        market={market}
                        isSelected={selectedMarket?.id === market.id}
                        onSelect={(m) => setSelectedMarket(m)}
                        onOpenDetails={(m) => setDetailModalMarket(m)}
                        isFavorite={favorites.has(market.id)}
                        onToggleFavorite={handleToggleFavorite}
                        userRating={userRatings[market.id]}
                        onRate={handleRateMarket}
                        userLocation={userLocation}
                        travelMode={filters.travelMode || 'driving'}
                        isCheckedIn={gamificationProfile.checkIns.some((c) => c.marketId === market.id)}
                        onCheckIn={handleCheckIn}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            ) : (
              <div className="h-[calc(100vh-220px)] w-full rounded-xl overflow-hidden">
                <MarketMap
                  markets={displayedMarkets}
                  selectedMarket={selectedMarket}
                  onSelectMarket={(m) => setSelectedMarket(m)}
                  userLocation={userLocation}
                  onOpenDetails={(m) => setDetailModalMarket(m)}
                  userRatings={userRatings}
                  travelMode={filters.travelMode || 'driving'}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 text-xs text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-neutral-100 text-sm">PasarQuest</span>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-neutral-300 font-medium">
            Malaysian Night Market Directory & Foodie Quest • Built for local food lovers & night market community
          </p>
          <p className="text-[11px] text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Operating schedules and real-time statuses are subject to local authority (PBT) and vendor management.
          </p>
          <p className="text-[10px] text-neutral-500 font-mono pt-1">
            © 2026 PasarQuest. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Quick Access Pill with Level-Up Progress for Pasar Dex */}
      <div className="fixed bottom-5 right-5 z-30">
        <div className="relative">
          <button
            id="btn-floating-pasardex"
            type="button"
            onClick={() => setIsPasarDexOpen(true)}
            className="group flex flex-col gap-1.5 rounded-2xl border border-amber-500/60 bg-neutral-900/95 p-2.5 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-850 hover:border-amber-400 ring-2 ring-amber-500/20 text-left min-w-[220px] max-w-[300px]"
            title={`Pasar Dex: Level ${currentLevelInfo.level} (${currentLevelInfo.title}) • ${
              streakStatus.streak > 0
                ? `${streakStatus.streak}-day streak (${streakStatus.isActiveToday ? 'maintained today' : 'pending today'}) • `
                : ''
            }${xpNeededForNextLevel > 0 ? `${xpNeededForNextLevel} XP needed for Level ${currentLevelInfo.level + 1}` : 'Max Level'}`}
          >
            {/* Top row: Level Badge, Title, and Current XP */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="flex h-5 items-center justify-center rounded-md bg-amber-500/25 px-1.5 text-[10px] font-black text-amber-300 border border-amber-500/40 shrink-0 shadow-xs">
                  Lv.{currentLevelInfo.level}
                </span>
                <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-200 truncate transition-colors">
                  Pasar Dex
                </span>
                {streakStatus.streak > 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black border shadow-xs transition-all ${
                      streakStatus.isActiveToday
                        ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/25 text-orange-200 border-orange-500/50 shadow-orange-500/20'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}
                    title={`${streakStatus.streak}-day check-in streak! ${
                      streakStatus.isActiveToday
                        ? 'Streak maintained today!'
                        : 'Check in today to keep your streak alive!'
                    }`}
                  >
                    <Flame
                      className={`h-3 w-3 ${
                        streakStatus.isActiveToday
                          ? 'fill-orange-400 text-orange-400 animate-pulse'
                          : 'fill-amber-400 text-amber-400'
                      }`}
                    />
                    <span className="font-extrabold tracking-tight">
                      {streakStatus.streak}d
                    </span>
                  </span>
                )}
                {dailyQuestsSummary.readyToClaim > 0 && (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-neutral-950 shadow-xs animate-bounce">
                    {dailyQuestsSummary.readyToClaim}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-amber-300/95 shrink-0 font-mono">
                {gamificationProfile.totalXp} XP
              </span>
            </div>

            {/* Visual Level-Up Progress Bar */}
            <div className="w-full space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.max(5, currentLevelInfo.progressPercent)}%` }}
                />
              </div>

              {/* Progress Detail: XP needed to next level & percentage */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 leading-tight">
                <span className="font-medium text-amber-300/90 truncate">
                  {xpNeededForNextLevel > 0 ? (
                    <>
                      <span className="font-bold text-amber-200">+{xpNeededForNextLevel} XP</span> to Lv.{currentLevelInfo.level + 1}
                    </>
                  ) : (
                    <span className="font-bold text-amber-200">Max Rank Reached!</span>
                  )}
                </span>
                <span className="font-mono text-[9px] text-neutral-400 pl-1 shrink-0">
                  {currentLevelInfo.progressPercent}%
                </span>
              </div>
            </div>
          </button>

          {/* Floating XP Animation for bottom pill */}
          <AnimatePresence>
            {recentXpGain && (
              <motion.div
                key={`floating-xp-pill-${recentXpGain.id}`}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0.9, 0],
                  y: [0, -14, -28, -38, -48],
                  scale: [0.6, 1.25, 1.15, 1, 0.85],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 2.2,
                  times: [0, 0.15, 0.45, 0.8, 1],
                  ease: 'easeOut',
                }}
                className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-2.5 py-1 text-xs font-black tracking-wide text-neutral-950 shadow-xl shadow-amber-500/40 ring-2 ring-white/60 drop-shadow-md"
              >
                <span>+{recentXpGain.amount} XP</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals & Drawers */}
      <MarketDetailModal
        market={detailModalMarket}
        onClose={() => setDetailModalMarket(null)}
        isFavorite={detailModalMarket ? favorites.has(detailModalMarket.id) : false}
        onToggleFavorite={handleToggleFavorite}
        userRating={detailModalMarket ? userRatings[detailModalMarket.id] : undefined}
        onRate={handleRateMarket}
        onClearRating={handleClearRating}
        userLocation={userLocation}
        isCheckedIn={detailModalMarket ? gamificationProfile.checkIns.some((c) => c.marketId === detailModalMarket.id) : false}
        onCheckIn={handleCheckIn}
        onReportSubmitted={(msg) => showToast(msg)}
      />

      <PasarDexModal
        isOpen={isPasarDexOpen}
        profile={gamificationProfile}
        onClose={() => setIsPasarDexOpen(false)}
        onClaimQuest={handleClaimDailyQuest}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        market={checkInMarket}
        gainedXp={checkInGainedXp}
        droppedFood={checkInDroppedFood}
        isFirstCheckInAtMarket={checkInIsFirstTime}
        newBadges={checkInNewBadges}
        leveledUp={checkInLeveledUp}
        newLevel={checkInNewLevel}
        streakCount={checkInStreakCount}
        streakIncremented={checkInStreakIncremented}
        onClose={() => setIsCheckInModalOpen(false)}
        onOpenPasarDex={() => {
          setIsCheckInModalOpen(false);
          setIsPasarDexOpen(true);
        }}
      />

      <SuggestMarketModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onMarketAdded={handleMarketAdded}
      />

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
