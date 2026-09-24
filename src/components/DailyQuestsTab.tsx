import React, { useState, useEffect, useMemo } from 'react';
import { Target, Clock, CheckCircle2, Flame, Gift } from 'lucide-react';
import { MarketCheckIn, DailyQuest } from '../types';
import {
  computeDailyQuests,
  saveTodayClaimedQuestId,
  getTimeUntilMidnight,
} from '../utils/dailyQuests';
import { playBadgeChime, playLevelUpFanfare } from '../utils/audioFeedback';

interface DailyQuestsTabProps {
  checkIns: MarketCheckIn[];
  onClaimReward: (xpReward: number, questTitle: string) => void;
}

export const DailyQuestsTab: React.FC<DailyQuestsTabProps> = ({
  checkIns,
  onClaimReward,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilMidnight());
  const [claimVersion, setClaimVersion] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilMidnight());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Re-compute quests when checkIns or claimVersion changes
  const quests: DailyQuest[] = useMemo(() => {
    return computeDailyQuests(checkIns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIns, claimVersion]);

  const completedCount = quests.filter((q) => q.completed).length;
  const claimedCount = quests.filter((q) => q.claimed).length;
  const totalPotentialXp = quests.reduce((sum, q) => sum + q.xpReward, 0);

  const handleClaim = (quest: DailyQuest) => {
    if (!quest.completed || quest.claimed) return;

    saveTodayClaimedQuestId(quest.id);
    setClaimVersion((v) => v + 1);

    // Audio feedback celebration for claiming quest
    playLevelUpFanfare();
    onClaimReward(quest.xpReward, quest.title);
  };

  return (
    <div className="space-y-6">
      {/* Daily Overview Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-emerald-500/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
              Daily Street Food Missions
            </div>
            <h3 className="font-display text-lg font-black text-white">
              Today's Pasar Challenges
            </h3>
            <p className="text-xs text-neutral-300 max-w-md">
              Complete daily explorations across Malaysian pasar malam to rack up bonus XP and level up faster in your Pasar Dex.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0 gap-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              Resets in <span className="font-bold text-white">{timeRemaining}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Up to +{totalPotentialXp} XP daily
            </span>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400 font-medium">Daily Completion Progress</span>
            <span className="font-bold text-white">
              {completedCount} of {quests.length} completed
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${(completedCount / quests.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-400" />
          Active Missions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {quests.map((quest) => {
            const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
            const isReadyToClaim = quest.completed && !quest.claimed;

            return (
              <div
                key={quest.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  quest.claimed
                    ? 'border-neutral-800/60 bg-neutral-950/40 opacity-70'
                    : isReadyToClaim
                    ? 'border-amber-400/80 bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-xl shadow-inner">
                        {quest.icon}
                      </div>
                      <div>
                        <h5 className="font-display text-sm font-bold text-white">
                          {quest.title}
                        </h5>
                        <p className="text-xs text-neutral-400 leading-snug">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 shrink-0">
                      +{quest.xpReward} XP
                    </span>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">
                        Progress: {quest.current} / {quest.target}
                      </span>
                      <span className="font-semibold text-neutral-300">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          quest.completed
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400">
                    {quest.claimed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reward Claimed
                      </span>
                    ) : isReadyToClaim ? (
                      <span className="text-amber-300 font-semibold animate-pulse">
                        Mission Complete!
                      </span>
                    ) : (
                      <span>In progress</span>
                    )}
                  </div>

                  <div>
                    {quest.claimed ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-500 cursor-not-allowed"
                      >
                        Claimed
                      </button>
                    ) : isReadyToClaim ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(quest)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-1.5 text-xs font-black text-neutral-950 transition hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                      >
                        <Gift className="h-3.5 w-3.5" />
                        Claim +{quest.xpReward} XP
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-neutral-500">
                        {quest.target - quest.current} more needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
