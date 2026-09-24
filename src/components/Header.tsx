import React, { useState, useEffect } from 'react';
import { Heart, PlusCircle, UtensilsCrossed, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getMalaysiaNow } from '../utils/marketUtils';
import { GamificationProfile } from '../types';
import { calculateLevel } from '../data/pasarDexData';
import { PWAInstallButton } from './PWAInstallButton';

export interface XpGainEvent {
  id: number;
  amount: number;
}

interface HeaderProps {
  favoritesCount: number;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenSuggestModal: () => void;
  totalMarkets: number;
  gamificationProfile?: GamificationProfile;
  onOpenPasarDex?: () => void;
  recentXpGain?: XpGainEvent | null;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  favoritesOnly,
  onToggleFavorites,
  onOpenSuggestModal,
  totalMarkets,
  gamificationProfile,
  onOpenPasarDex,
  recentXpGain,
}) => {
  const [mytTime, setMytTime] = useState('');
  const [dayName, setDayName] = useState('');
  const [floatingXpList, setFloatingXpList] = useState<XpGainEvent[]>([]);

  const levelInfo = gamificationProfile
    ? calculateLevel(gamificationProfile.totalXp)
    : null;

  useEffect(() => {
    if (recentXpGain && recentXpGain.amount > 0) {
      const event = recentXpGain;
      setFloatingXpList((prev) => [...prev, event]);
      const timer = setTimeout(() => {
        setFloatingXpList((prev) => prev.filter((item) => item.id !== event.id));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [recentXpGain]);

  useEffect(() => {
    const updateClock = () => {
      const myt = getMalaysiaNow();
      const hours = myt.getHours().toString().padStart(2, '0');
      const mins = myt.getMinutes().toString().padStart(2, '0');
      setMytTime(`${hours}:${mins}`);

      const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setDayName(daysEn[myt.getDay()]);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl flex items-center gap-2">
                PasarQuest
              </h1>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30 sm:inline-flex">
                v1.0.0
              </span>
            </div>
            <p className="hidden text-xs text-neutral-400 sm:block">
              Malaysian Night Market Directory & Foodie Quest • <span className="text-neutral-300 font-medium">{totalMarkets} locations</span>
            </p>
          </div>
        </div>

        {/* Live Malaysia Clock Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-900/60 px-3.5 py-1.5 text-xs text-neutral-300 shadow-inner">
          <span className="font-medium text-neutral-200">
            {dayName}, {mytTime} <span className="text-neutral-400">MYT (UTC+8)</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Pasar Dex Gamification Button */}
          {onOpenPasarDex && (
            <div className="relative">
              <button
                id="btn-open-pasardex"
                type="button"
                onClick={onOpenPasarDex}
                className="relative flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-neutral-900 px-3 py-2 text-xs font-bold text-amber-300 shadow-md transition-all duration-200 hover:border-amber-400 hover:bg-amber-500/25 ring-1 ring-amber-500/30"
                title="Open Pasar Dex & Foodie Passport"
              >
                <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                <span>Pasar Dex</span>
                {levelInfo && (
                  <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] font-black text-amber-200 border border-amber-500/40">
                    Lv.{levelInfo.level}
                  </span>
                )}
              </button>

              {/* Floating XP Gain Animation */}
              <AnimatePresence>
                {floatingXpList.map((item) => (
                  <motion.div
                    key={item.id}
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
                    <span>+{item.amount} XP</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Favorites Button */}
          <button
            id="btn-favorites-toggle"
            onClick={onToggleFavorites}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
              favoritesOnly
                ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50 shadow-lg shadow-rose-950/30'
                : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
            title="Saved Favorites"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                favoritesOnly
                  ? 'fill-rose-500 text-rose-500'
                  : favoritesCount > 0
                  ? 'fill-rose-500/40 text-rose-400'
                  : 'text-neutral-400'
              }`}
            />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* PWA Install Button (Mobile & Desktop App) */}
          <PWAInstallButton />

          {/* Suggest Market Button */}
          <button
            id="btn-open-suggest-modal"
            onClick={onOpenSuggestModal}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-500/60 shadow-sm"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Add Market</span>
          </button>

        </div>
      </div>
    </header>
  );
};
