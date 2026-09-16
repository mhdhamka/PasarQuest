import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  CheckCircle2,
  Award,
  X,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';
import { Market, CollectibleFood } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  market: Market | null;
  gainedXp: number;
  droppedFood: CollectibleFood | null;
  isFirstCheckInAtMarket: boolean;
  newBadges: string[];
  leveledUp?: boolean;
  newLevel?: { level: number; title: string } | null;
  streakCount?: number;
  streakIncremented?: boolean;
  onClose: () => void;
  onOpenPasarDex: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  market,
  gainedXp,
  droppedFood,
  isFirstCheckInAtMarket,
  newBadges,
  leveledUp = false,
  newLevel = null,
  streakCount,
  streakIncremented = false,
  onClose,
  onOpenPasarDex,
}) => {
  if (!isOpen || !market) return null;

  const rarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/80 bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 text-amber-300 ring-1 ring-amber-500/50';
      case 'rare':
        return 'border-purple-500/70 bg-gradient-to-b from-purple-500/20 via-neutral-900 to-neutral-950 text-purple-300 ring-1 ring-purple-500/40';
      default:
        return 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/15 via-neutral-900 to-neutral-950 text-emerald-300';
    }
  };

  const rarityBadge = (rarity?: string) => {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-100 shadow-2xl shadow-emerald-950/40"
        >
          {/* Top Banner Ribbon */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 px-6 py-4 text-center">
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Passport Stamped!
            </div>
            <h2 className="mt-1 font-display text-xl font-extrabold text-white">
              {market.name}
            </h2>
            <p className="text-xs text-emerald-100/90 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {market.district}, {market.state}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* XP Gain Splash */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-neutral-950 font-black">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-300">
                    {isFirstCheckInAtMarket ? 'First Visit Bonus!' : 'Market Check-In'}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Added to your Pasar Malam Passport
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-black text-emerald-400">
                  +{gainedXp}
                </span>
                <span className="text-xs font-bold text-emerald-300 ml-1">XP</span>
              </div>
            </div>

            {/* Streak Status Banner */}
            {typeof streakCount === 'number' && streakCount > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-neutral-900 p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-neutral-950 font-black shadow-xs">
                    <Flame className="h-5 w-5 fill-neutral-950 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>{streakCount}-Day Check-in Streak!</span>
                      {streakIncremented && (
                        <span className="rounded-full bg-orange-500/30 px-1.5 py-0.2 text-[9px] font-bold text-orange-200 border border-orange-500/40">
                          +1 Day 🔥
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {streakCount > 1
                        ? 'Awesome devotion! Check in again tomorrow to maintain it.'
                        : 'Daily streak ignited! Check in again tomorrow to build your streak.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dropped Food Discovery */}
            {droppedFood && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-neutral-200">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-amber-400" />
                    Pasar Dex Discovery!
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${rarityBadge(
                      droppedFood.rarity
                    )}`}
                  >
                    {droppedFood.rarity}
                  </span>
                </div>

                <div
                  className={`relative flex items-start gap-3.5 rounded-xl border p-3.5 transition ${rarityColor(
                    droppedFood.rarity
                  )}`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-950/60 text-3xl border border-white/10 shadow-inner">
                    {droppedFood.iconEmoji}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-white truncate">
                        {droppedFood.name}
                      </h4>
                      <span className="text-xs font-bold text-amber-300 shrink-0">
                        +{droppedFood.xpValue} XP
                      </span>
                    </div>
                    {droppedFood.malayName && (
                      <p className="text-[11px] italic text-neutral-400">
                        {droppedFood.malayName}
                      </p>
                    )}
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {droppedFood.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Level Up Banner */}
            {leveledUp && newLevel && (
              <div className="rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 p-3.5 space-y-1 text-center shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
                  ⭐ LEVEL UP IN PASAR DEX!
                </div>
                <div className="text-sm font-black text-white">
                  Rank Achieved: Level {newLevel.level} • {newLevel.title}
                </div>
              </div>
            )}

            {/* Newly Unlocked Badges */}
            {newBadges.length > 0 && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Award className="h-4 w-4" />
                  New Badge Unlocked!
                </div>
                <div className="text-neutral-200">
                  You earned: {newBadges.join(', ')}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPasarDex();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/60 bg-emerald-500 px-4 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                <span>Open Pasar Dex</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-800 bg-neutral-800/80 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
