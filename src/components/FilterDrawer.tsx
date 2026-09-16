import React from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ArrowDownUp,
  Star,
  Car,
  Footprints,
  Navigation,
} from 'lucide-react';
import { FilterState, SortOption, TravelMode } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'smart', label: 'Smart (Recommended)' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'distance', label: 'Nearest First' },
    { id: 'shops', label: 'Most Stalls' },
    { id: 'name-asc', label: 'Alphabetical (A - Z)' },
  ];

  const ratingFilters = [
    { value: 0, label: 'Any Rating' },
    { value: 3.5, label: '3.5+ ★' },
    { value: 4.0, label: '4.0+ ★' },
    { value: 4.5, label: '4.5+ ★ (Top Spots)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="drawer-filters"
        className="relative flex h-full w-full max-w-sm flex-col border-l border-neutral-800 bg-neutral-950 p-6 text-neutral-100 shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display text-base font-bold text-white">Filters & Sort</h3>
          </div>
          <button
            id="btn-close-filter-drawer"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter List */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Sort By */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <ArrowDownUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sort By</span>
            </label>
            <div className="space-y-1.5">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange({ sortBy: opt.id })}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    filters.sortBy === opt.id
                      ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border border-neutral-800/80 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-850'
                  }`}
                >
                  <span>{opt.label}</span>
                  {filters.sortBy === opt.id && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Mode (Driving vs Walking) */}
          <div className="space-y-2.5 border-t border-neutral-800/80 pt-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                <span>Travel Mode & Route Calculation</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-drawer-mode-driving"
                onClick={() => onFilterChange({ travelMode: 'driving' })}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-semibold transition border ${
                  (filters.travelMode || 'driving') === 'driving'
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                }`}
              >
                <Car className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Driving</span>
                <span className="text-[10px] text-neutral-500 font-normal">Road routes</span>
              </button>

              <button
                type="button"
                id="btn-drawer-mode-walking"
                onClick={() => onFilterChange({ travelMode: 'walking' })}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-semibold transition border ${
                  filters.travelMode === 'walking'
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                }`}
              >
                <Footprints className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Walking</span>
                <span className="text-[10px] text-neutral-500 font-normal">Footpaths</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Calculates accurate distance and estimated travel time from your GPS location, calibrated for Malaysian road networks and evening market traffic.
            </p>
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-2.5 border-t border-neutral-800/80 pt-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>Minimum Rating</span>
              </label>
              {Boolean(filters.minRating && filters.minRating > 0) && (
                <span className="text-xs font-bold text-amber-400">
                  ≥ {filters.minRating}★
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ratingFilters.map((rf) => {
                const isSelected = (filters.minRating || 0) === rf.value;
                return (
                  <button
                    key={rf.value}
                    type="button"
                    onClick={() => onFilterChange({ minRating: rf.value })}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-center transition ${
                      isSelected
                        ? 'border border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-sm'
                        : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                    }`}
                  >
                    {rf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Facilities & Amenities */}
          <div className="space-y-2.5 border-t border-neutral-800/80 pt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Facilities & Amenities
            </label>

            <div className="space-y-2">
              {/* Parking */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 cursor-pointer hover:bg-neutral-850">
                <span className="text-xs font-medium text-neutral-200">Parking Available</span>
                <input
                  type="checkbox"
                  checked={filters.hasParking}
                  onChange={(e) => onFilterChange({ hasParking: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
              </label>

              {/* Accessible Parking */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 cursor-pointer hover:bg-neutral-850">
                <span className="text-xs font-medium text-neutral-200">
                  Accessible Parking
                </span>
                <input
                  type="checkbox"
                  checked={filters.hasAccessibleParking}
                  onChange={(e) => onFilterChange({ hasAccessibleParking: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
              </label>

              {/* Surau */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 cursor-pointer hover:bg-neutral-850">
                <span className="text-xs font-medium text-neutral-200">Surau (Prayer Room)</span>
                <input
                  type="checkbox"
                  checked={filters.hasSurau}
                  onChange={(e) => onFilterChange({ hasSurau: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
              </label>

              {/* Toilet */}
              <label className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 cursor-pointer hover:bg-neutral-850">
                <span className="text-xs font-medium text-neutral-200">Restroom Available</span>
                <input
                  type="checkbox"
                  checked={filters.hasToilet}
                  onChange={(e) => onFilterChange({ hasToilet: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-800 pt-4 flex items-center justify-between gap-3">
          <button
            id="btn-reset-filters"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>

          <button
            id="btn-apply-filters"
            onClick={onClose}
            className="flex-1 rounded-xl bg-emerald-500 py-2 px-4 text-xs font-bold text-neutral-950 transition hover:bg-emerald-400 text-center"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
