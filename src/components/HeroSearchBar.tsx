import React, { useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  SlidersHorizontal,
  X,
  Layers,
  Map,
  List,
  ChevronLeft,
  ChevronRight,
  Car,
  Footprints,
} from 'lucide-react';
import { FilterState, ViewMode, UserCoordinates } from '../types';
import { MALAYSIAN_STATES, POPULAR_FOOD_TAGS, DAY_NAMES, DAY_CODES } from '../utils/constants';

interface HeroSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  userLocation: UserCoordinates | null;
  isLocating: boolean;
  onRequestLocation: () => void;
  onClearLocation: () => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  stateCounts: Record<string, number>;
}

export const HeroSearchBar: React.FC<HeroSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  userLocation,
  isLocating,
  onRequestLocation,
  onClearLocation,
  onOpenFilterDrawer,
  activeFilterCount,
  stateCounts,
}) => {
  // Scroll references for carousels
  const daysScrollRef = useRef<HTMLDivElement>(null);
  const foodScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border-b border-neutral-800/80 px-4 py-4 sm:px-6 shadow-xl">
      <div className="mx-auto max-w-7xl space-y-4">
        
        {/* Row 1: Main Search Bar + Find Near Me + Filters + View Mode Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="input-market-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search night market by name, district, or street food ..."
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 py-3 pl-10 pr-9 text-sm text-neutral-100 placeholder-neutral-500 shadow-inner outline-none transition focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Actions & View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Near Me / Geolocation Action */}
            <button
              id="btn-find-near-me"
              onClick={userLocation ? onClearLocation : onRequestLocation}
              disabled={isLocating}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-semibold shadow-sm transition-all ${
                userLocation
                  ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'border border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-800 hover:text-white'
              }`}
              title={userLocation ? 'Click to clear location' : 'Find night markets near your current location'}
            >
              {isLocating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <span>Locating...</span>
                </>
              ) : userLocation ? (
                <>
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium">GPS Active</span>
                  <X className="h-3.5 w-3.5 text-neutral-400 hover:text-white" />
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Near Me</span>
                </>
              )}
            </button>

            {/* Quick Travel Mode Switcher (Driving vs Walking) */}
            {userLocation && (
              <div className="flex items-center rounded-xl border border-neutral-700/80 bg-neutral-950 p-1 shadow-inner">
                <button
                  type="button"
                  id="btn-mode-drive-quick"
                  onClick={() => onFilterChange({ travelMode: 'driving', sortBy: 'distance' })}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    (filters.travelMode || 'driving') === 'driving' && filters.sortBy === 'distance'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : (filters.travelMode || 'driving') === 'driving'
                      ? 'bg-neutral-850 text-neutral-200'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Driving (Calculates accurate road route distance and travel time)"
                >
                  <Car className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Drive</span>
                </button>
                <button
                  type="button"
                  id="btn-mode-walk-quick"
                  onClick={() => onFilterChange({ travelMode: 'walking', sortBy: 'distance' })}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    filters.travelMode === 'walking' && filters.sortBy === 'distance'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : filters.travelMode === 'walking'
                      ? 'bg-neutral-850 text-neutral-200'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Walking (Calculates accurate pedestrian footpath distance and time)"
                >
                  <Footprints className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Walk</span>
                </button>
              </div>
            )}

            {/* Filter Drawer Trigger */}
            <button
              id="btn-open-filter-drawer"
              onClick={onOpenFilterDrawer}
              className={`relative flex items-center gap-1.5 rounded-xl border px-3.5 py-3 text-xs font-medium transition ${
                activeFilterCount > 0
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-neutral-950">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Collapsible View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-neutral-700/80 bg-neutral-950 p-1 shadow-inner">
              <button
                id="btn-view-split"
                onClick={() => onViewModeChange('split')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  viewMode === 'split'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Split View (Cards & Map)"
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">Split View</span>
              </button>
              <button
                id="btn-view-list"
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Grid Cards View"
              >
                <List className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">Cards</span>
              </button>
              <button
                id="btn-view-map"
                onClick={() => onViewModeChange('map')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Full Map View"
              >
                <Map className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: State Selector + Open Now Toggle + Collapsible Day Pills with Scroll Arrows */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            {/* State Dropdown */}
            <div className="relative">
              <select
                id="select-state-filter"
                value={filters.state}
                onChange={(e) => onFilterChange({ state: e.target.value })}
                className="appearance-none rounded-xl border border-neutral-700 bg-neutral-900 py-2 pl-3.5 pr-8 text-xs font-semibold text-neutral-200 shadow-sm outline-none transition hover:border-neutral-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {MALAYSIAN_STATES.map((st) => (
                  <option key={st} value={st} className="bg-neutral-900 text-neutral-200">
                    {st} {stateCounts[st] ? `(${stateCounts[st]})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400">
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* "Open Now" Live Toggle */}
            <button
              id="btn-toggle-open-now"
              onClick={() => onFilterChange({ openNow: !filters.openNow })}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                filters.openNow
                  ? 'border border-emerald-500/80 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                  : 'border border-neutral-700/80 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  filters.openNow ? 'bg-emerald-400' : 'bg-neutral-500'
                }`}
              />
              <span>Open Now</span>
            </button>
          </div>

          {/* Collapsible Day Pills with Scroll Arrows */}
          <div className="flex items-center gap-1 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => scrollContainer(daysScrollRef, 'left')}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={daysScrollRef}
              className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-xs sm:max-w-md lg:max-w-xl px-1"
            >
              <button
                id="btn-day-all"
                onClick={() => onFilterChange({ day: 'all' })}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filters.day === 'all'
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                All Days
              </button>
              <button
                id="btn-day-today"
                onClick={() => onFilterChange({ day: 'today' })}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filters.day === 'today'
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                Today
              </button>
              <button
                id="btn-day-tomorrow"
                onClick={() => onFilterChange({ day: 'tomorrow' })}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filters.day === 'tomorrow'
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                Tomorrow
              </button>
              {DAY_CODES.map((code) => {
                const info = DAY_NAMES[code];
                const isSelected = filters.day === code;
                return (
                  <button
                    key={code}
                    id={`btn-day-${code}`}
                    onClick={() => onFilterChange({ day: code })}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {info.shortEn}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollContainer(daysScrollRef, 'right')}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 3: Street Food Cravings Horizontal Carousel with Left/Right Navigation Arrows */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-neutral-400 shrink-0 hidden sm:flex items-center gap-1 mr-1">
            Popular Cravings:
          </span>

          <button
            onClick={() => scrollContainer(foodScrollRef, 'left')}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition shadow-sm shrink-0"
            title="Scroll Left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={foodScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 flex-1"
          >
            {POPULAR_FOOD_TAGS.map((tag) => {
              const isSelected = filters.food === tag.id;
              return (
                <button
                  key={tag.id}
                  id={`btn-food-${tag.id.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => onFilterChange({ food: isSelected ? 'all' : tag.id })}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border border-emerald-500/80 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                      : 'border border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  <span>{tag.name}</span>
                  {isSelected && <X className="h-3 w-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollContainer(foodScrollRef, 'right')}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition shadow-sm shrink-0"
            title="Scroll Right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
