import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Navigation, X, Car, Footprints } from 'lucide-react';

interface AutoLocationPromptProps {
  isOpen: boolean;
  isLocating: boolean;
  onEnableLocation: () => void;
  onDismiss: () => void;
}

export const AutoLocationPrompt: React.FC<AutoLocationPromptProps> = ({
  isOpen,
  isLocating,
  onEnableLocation,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="auto-location-prompt-banner"
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-b border-emerald-500/30 bg-gradient-to-r from-neutral-900 via-emerald-950/40 to-neutral-900 shadow-lg"
        >
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Left Info: Radar Icon + Title & Explanation */}
              <div className="flex items-start sm:items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                  <Compass className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      Find Night Markets Near You
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.2 text-[10px] font-semibold text-emerald-300">
                      Auto-Sort Ready
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Enable location to automatically sort all pasar malam by nearest distance and calculate live travel times.
                  </p>
                  <div className="hidden md:flex items-center gap-3 pt-0.5 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-emerald-400" />
                      Driving times
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Footprints className="h-3 w-3 text-teal-400" />
                      Walking routes
                    </span>
                    <span>•</span>
                    <span>Accurate coordinate routing</span>
                  </div>
                </div>
              </div>

              {/* Right Actions: Enable Button + Dismiss */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="btn-auto-location-dismiss"
                  onClick={onDismiss}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition hover:bg-neutral-800"
                >
                  Browse All
                </button>

                <button
                  type="button"
                  id="btn-auto-location-enable"
                  onClick={onEnableLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/80 bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow-md transition hover:bg-emerald-400 hover:shadow-emerald-500/20 disabled:opacity-60"
                >
                  {isLocating ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />
                      <span>Enable & Sort by Distance</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-auto-location-close-x"
                  onClick={onDismiss}
                  className="p-1 text-neutral-500 hover:text-neutral-300 transition"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
