import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Award,
  BookOpen,
  Compass,
  MapPin,
  Flame,
  CheckCircle2,
  Lock,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Target,
} from 'lucide-react';
import {
  GamificationProfile,
  CollectibleFood,
  FoodRarity,
} from '../types';
import {
  COLLECTIBLE_FOODS,
  BADGE_DEFINITIONS,
  calculateLevel,
} from '../data/pasarDexData';
import {
  playBadgeChime,
  playLevelUpFanfare,
  isAudioEnabled,
  setAudioEnabled,
} from '../utils/audioFeedback';
import { DailyQuestsTab } from './DailyQuestsTab';
import { computeDailyQuests } from '../utils/dailyQuests';
import { getStreakStatus } from '../utils/streak';

interface PasarDexModalProps {
  isOpen: boolean;
  profile: GamificationProfile;
  onClose: () => void;
  onClaimQuest?: (xpReward: number, questTitle: string) => void;
}

type TabType = 'pasardex' | 'passport' | 'badges' | 'quests';

export const PasarDexModal: React.FC<PasarDexModalProps> = ({
  isOpen,
  profile,
  onClose,
  onClaimQuest,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pasardex');
  const [selectedRarity, setSelectedRarity] = useState<'all' | FoodRarity>('all');
  const [selectedFood, setSelectedFood] = useState<CollectibleFood | null>(null);
  const [soundActive, setSoundActive] = useState(() => isAudioEnabled());

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setAudioEnabled(next);
    if (next) {
      playBadgeChime();
    }
  };

  const levelInfo = calculateLevel(profile.totalXp);
  const collectedCount = Object.keys(profile.collectedFoods).length;
  const totalFoods = COLLECTIBLE_FOODS.length;
  const dexCompletionPercent = Math.round((collectedCount / totalFoods) * 100);

  const streakStatus = getStreakStatus(profile);

  const dailyQuests = computeDailyQuests(profile.checkIns);
  const completedUnclaimedQuests = dailyQuests.filter((q) => q.completed && !q.claimed).length;

  const filteredFoods = COLLECTIBLE_FOODS.filter((food) => {
    if (selectedRarity === 'all') return true;
    return food.rarity === selectedRarity;
  });

  const getRarityBadge = (rarity: FoodRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'rare':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-100 shadow-2xl"
        >
          {/* Header & Level Status */}
          <div className="relative border-b border-neutral-800 bg-neutral-950 p-5 sm:p-6">
            <div className="absolute right-4 top-4 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className={`rounded-full p-2 transition ${
                  soundActive
                    ? 'text-amber-300 hover:bg-neutral-800 hover:text-amber-200'
                    : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                }`}
                title={soundActive ? 'Sound effects enabled (Click to mute)' : 'Sound effects muted (Click to enable)'}
              >
                {soundActive ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pr-16">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playLevelUpFanfare()}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-neutral-900 to-amber-900/30 text-2xl shadow-inner hover:scale-105 transition cursor-pointer"
                  title="Play Level-Up Fanfare"
                >
                  ⭐
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg sm:text-xl font-black text-white">
                      Pasar Dex & Foodie Passport
                    </h2>
                    <button
                      type="button"
                      onClick={() => playLevelUpFanfare()}
                      className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                      title="Play Level-Up Fanfare"
                    >
                      Lv.{levelInfo.level} {levelInfo.title}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Discover authentic street food delicacies and collect Malaysian night market stamps.
                  </p>
                </div>
              </div>

              {/* Stats: Daily Check-in Streak & XP Progress */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                {/* Daily Check-in Streak Capsule */}
                <div
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition ${
                    streakStatus.streak > 0
                      ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-neutral-900 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/20'
                      : 'border-neutral-800 bg-neutral-900/80'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      streakStatus.streak > 0
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-neutral-950 shadow-sm shadow-orange-500/30'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700/60'
                    }`}
                  >
                    <Flame
                      className={`h-5 w-5 ${
                        streakStatus.streak > 0
                          ? 'fill-neutral-950 text-neutral-950 animate-pulse'
                          : 'text-neutral-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display text-sm font-black text-white">
                        {streakStatus.streak > 0 ? `${streakStatus.streak}-Day Streak` : '0-Day Streak'}
                      </span>
                      {streakStatus.isActiveToday ? (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                          Active Today
                        </span>
                      ) : streakStatus.isPendingToday ? (
                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30 animate-pulse">
                          Pending Today
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-800 px-1.5 py-0.2 text-[9px] font-medium text-neutral-400">
                          Not started
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      {streakStatus.streak > 0
                        ? `Best: ${streakStatus.longestStreak} ${streakStatus.longestStreak === 1 ? 'day' : 'days'}`
                        : 'Check in daily to build streak'}
                    </p>
                  </div>
                </div>

                {/* XP Progress Capsule */}
                <button
                  type="button"
                  onClick={() => playLevelUpFanfare()}
                  className="w-full sm:w-52 space-y-1.5 bg-neutral-900/90 hover:bg-neutral-850 rounded-xl px-3 py-2 border border-neutral-800 hover:border-amber-500/40 transition text-left cursor-pointer"
                  title="Level Progress (Click to play fanfare)"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-neutral-300">
                      ⭐ {profile.totalXp} XP
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Next: {levelInfo.nextLevelXp} XP
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 border-t border-neutral-800/80 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('pasardex')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'pasardex'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span>Pasar Dex ({collectedCount}/{totalFoods})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('passport')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'passport'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Passport Stamps ({profile.checkIns.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'badges'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Badges ({profile.unlockedBadges.length}/{BADGE_DEFINITIONS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quests')}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'quests'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Daily Quests ({dailyQuests.filter((q) => q.claimed).length}/{dailyQuests.length})</span>
                {completedUnclaimedQuests > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-amber-400/50" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {/* TAB 1: PASAR DEX GRID */}
            {activeTab === 'pasardex' && (
              <div className="space-y-5">
                {/* Dex Status & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-400">
                    Dex Completion:{' '}
                    <span className="font-bold text-emerald-400">
                      {dexCompletionPercent}%
                    </span>{' '}
                    ({collectedCount} of {totalFoods} unlocked)
                  </div>

                  <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                    {(['all', 'common', 'rare', 'legendary'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRarity(r)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition shrink-0 ${
                          selectedRarity === r
                            ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredFoods.map((food) => {
                    const isDiscovered = Boolean(profile.collectedFoods[food.id]);
                    const collectedRecord = profile.collectedFoods[food.id];

                    return (
                      <div
                        key={food.id}
                        onClick={() => isDiscovered && setSelectedFood(food)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all text-left ${
                          isDiscovered
                            ? 'border-neutral-800 bg-neutral-950/80 hover:border-emerald-500/50 hover:bg-neutral-900 cursor-pointer shadow-sm'
                            : 'border-neutral-800/40 bg-neutral-950/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getRarityBadge(
                              food.rarity
                            )}`}
                          >
                            {food.rarity}
                          </span>
                          {isDiscovered && collectedRecord && collectedRecord.count > 1 && (
                            <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold text-neutral-300">
                              ×{collectedRecord.count}
                            </span>
                          )}
                        </div>

                        <div className="my-3 flex flex-col items-center justify-center text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800/80 text-3xl shadow-inner">
                            {isDiscovered ? food.iconEmoji : <Lock className="h-5 w-5 text-neutral-600" />}
                          </div>
                          <h4 className="mt-2 font-display text-xs font-bold text-white line-clamp-1">
                            {isDiscovered ? food.name : '??? Locked'}
                          </h4>
                          <span className="text-[10px] text-neutral-400 capitalize">
                            {isDiscovered ? food.category : 'Discover at night market'}
                          </span>
                        </div>

                        <div className="border-t border-neutral-800/60 pt-2 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>+{food.xpValue} XP</span>
                          {isDiscovered ? (
                            <span className="text-emerald-400 font-medium">Logged ✓</span>
                          ) : (
                            <span className="text-neutral-600">Unregistered</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PASSPORT STAMPS */}
            {activeTab === 'passport' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-xs text-neutral-300">
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    Official Pasar Malam Visitor Log
                  </h3>
                  <p className="mt-1 text-neutral-400">
                    Each time you visit and check into a night market, you receive an ink stamp in your official passport with coordinates and timestamps.
                  </p>
                </div>

                {profile.checkIns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                    <BookOpen className="h-10 w-10 text-neutral-600 mb-2" />
                    <h4 className="font-bold text-neutral-300">No stamps yet</h4>
                    <p className="text-xs text-neutral-500 max-w-xs mt-1">
                      Check in to any night market card or detail view to collect your first official ink stamp!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.checkIns.map((stamp, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-neutral-950 p-4 shadow-sm"
                      >
                        {/* Stamp Seal Graphic */}
                        <div className="absolute -right-3 -bottom-3 h-20 w-20 rounded-full border-2 border-dashed border-emerald-500/20 pointer-events-none flex items-center justify-center text-[9px] font-black text-emerald-500/20 rotate-12">
                          VERIFIED
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Stamp #{profile.checkIns.length - idx}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(stamp.timestamp).toLocaleDateString('en-MY', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <h4 className="mt-2 font-display text-sm font-bold text-white line-clamp-1">
                          {stamp.marketName}
                        </h4>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-neutral-500" />
                          {stamp.district}, {stamp.state}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BADGES */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BADGE_DEFINITIONS.map((badge) => {
                    const isUnlocked = profile.unlockedBadges.includes(badge.id);

                    return (
                      <div
                        key={badge.id}
                        onClick={() => {
                          if (isUnlocked) {
                            playBadgeChime();
                          }
                        }}
                        className={`flex items-start gap-3.5 rounded-xl border p-4 transition ${
                          isUnlocked
                            ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-950 shadow-sm cursor-pointer hover:scale-[1.01] hover:border-amber-400'
                            : 'border-neutral-800/60 bg-neutral-950/40 opacity-50'
                        }`}
                        title={isUnlocked ? 'Unlocked! Click to hear badge chime' : 'Locked badge'}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl border ${
                            isUnlocked
                              ? 'border-amber-500/40 bg-amber-500/20 text-white shadow-inner'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-600'
                          }`}
                        >
                          {isUnlocked ? badge.icon : <Lock className="h-5 w-5 text-neutral-600" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-xs font-bold text-white">
                              {badge.title}
                            </h4>
                            {isUnlocked && (
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                Unlocked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: DAILY QUESTS */}
            {activeTab === 'quests' && (
              <DailyQuestsTab
                checkIns={profile.checkIns}
                onClaimReward={(xp, questTitle) => {
                  if (onClaimQuest) {
                    onClaimQuest(xp, questTitle);
                  }
                }}
              />
            )}
          </div>

          {/* Delicacy Detail Drawer / Card Inspection */}
          {selectedFood && (
            <div className="border-t border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-3xl">
                    {selectedFood.iconEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-white">
                        {selectedFood.name}
                      </h4>
                      <span
                        className={`rounded-full border px-2 py-0.2 text-[9px] font-bold uppercase ${getRarityBadge(
                          selectedFood.rarity
                        )}`}
                      >
                        {selectedFood.rarity}
                      </span>
                    </div>
                    {selectedFood.malayName && (
                      <p className="text-xs italic text-neutral-400">
                        {selectedFood.malayName}
                      </p>
                    )}
                    <p className="text-xs text-neutral-300 mt-1">
                      {selectedFood.description}
                    </p>
                    <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                      Flavor profile: {selectedFood.tasteProfile}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFood(null)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
