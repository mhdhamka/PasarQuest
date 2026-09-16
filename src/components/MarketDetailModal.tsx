import React, { useState } from 'react';
import {
  X,
  MapPin,
  Car,
  Building,
  Check,
  Copy,
  ExternalLink,
  Navigation,
  Heart,
  Share2,
  Calendar,
  Accessibility,
  Info,
  Star,
  Footprints,
  AlertTriangle,
} from 'lucide-react';
import { Market, UserCoordinates, TravelMode } from '../types';
import {
  getMarketOpenStatus,
  calculateDistance,
  formatDistance,
  getTravelEstimate,
  getDirectionsUrls,
} from '../utils/marketUtils';
import { getMarketRating } from '../utils/ratingUtils';
import { StarRatingWidget } from './StarRatingWidget';
import { MarketWeatherWidget } from './MarketWeatherWidget';
import { ReportIssueModal } from './ReportIssueModal';
import { DAY_NAMES } from '../utils/constants';

interface MarketDetailModalProps {
  market: Market | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  userRating?: number;
  onRate?: (marketId: string, rating: number) => void;
  onClearRating?: (marketId: string) => void;
  userLocation: UserCoordinates | null;
  isCheckedIn?: boolean;
  onCheckIn?: (market: Market) => void;
  onReportSubmitted?: (message: string) => void;
}

export const MarketDetailModal: React.FC<MarketDetailModalProps> = ({
  market,
  onClose,
  isFavorite,
  onToggleFavorite,
  userRating,
  onRate,
  onClearRating,
  userLocation,
  isCheckedIn = false,
  onCheckIn,
  onReportSubmitted,
}) => {
  if (!market) return null;

  const [navMode, setNavMode] = useState<TravelMode>('driving');
  const openStatus = getMarketOpenStatus(market);
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const ratingInfo = getMarketRating(market, userRating);

  const travelEstimate =
    userLocation && market.location && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)
      ? getTravelEstimate(
          userLocation.lat,
          userLocation.lng,
          market.location.latitude,
          market.location.longitude
        )
      : null;

  const distanceKm =
    userLocation && market.location
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          market.location.latitude,
          market.location.longitude
        )
      : null;

  const isNearby = distanceKm !== null && distanceKm <= 3.0;

  const directions = getDirectionsUrls(market, navMode, userLocation);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(market.address || market.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: market.name,
          text: `Night Market ${market.name} - ${market.address}`,
          url: market.location.gmaps_link || window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyAddress();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-market-detail"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    openStatus.status === 'open'
                      ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                      : openStatus.status === 'opening-soon'
                      ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                      : 'border border-neutral-700 bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      openStatus.status === 'open'
                        ? 'bg-emerald-400'
                        : openStatus.status === 'opening-soon'
                        ? 'bg-amber-400'
                        : 'bg-neutral-500'
                    }`}
                  />
                  <span>{openStatus.label}</span>
                </span>
                {travelEstimate ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-850 px-2.5 py-0.5 text-xs text-neutral-200 font-medium">
                    <Car className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">
                      {travelEstimate.formattedDrivingDuration} drive
                    </span>
                    <span className="text-neutral-400">
                      ({travelEstimate.formattedDrivingDistance})
                    </span>
                    {travelEstimate.isWalkable && (
                      <>
                        <span className="text-neutral-600">•</span>
                        <Footprints className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-neutral-300">
                          {travelEstimate.formattedWalkingDuration} walk
                        </span>
                      </>
                    )}
                  </span>
                ) : distanceKm !== null ? (
                  <span className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300 font-medium">
                    {formatDistance(distanceKm)} from your location
                  </span>
                ) : null}
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white pt-1">
                {market.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                {market.district ? `${market.district}, ` : ''}
                {market.state}
              </p>

              {/* Rating Mini Bar in Header */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 border border-amber-500/30 text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold">{ratingInfo.average.toFixed(1)}</span>
                  <span className="text-[11px] text-neutral-400">({ratingInfo.count} reviews)</span>
                </div>

                {ratingInfo.isCommunityFavorite && (
                  <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    ★ Community Favored
                  </span>
                )}

                {ratingInfo.userRating && (
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                    Your Rating: {ratingInfo.userRating}★
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Heart, Share, Close */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-detail-fav"
                onClick={() => onToggleFavorite(market.id)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-rose-400"
                title="Favorites"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                  }`}
                />
              </button>

              <button
                id="btn-detail-share"
                onClick={handleShare}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                id="btn-detail-close"
                onClick={onClose}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Gamification Passport & Dex Check-In Banner */}
          {onCheckIn && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl border border-amber-500/30">
                  ⭐
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Pasar Malam Passport & Dex</span>
                    {isCheckedIn && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                        Stamped ✓
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-neutral-300">
                    {isCheckedIn
                      ? 'You have stamped this market in your official passport!'
                      : isNearby
                      ? `You're nearby (${distanceKm ? distanceKm.toFixed(1) + ' km' : 'close'})! Check in now to earn XP & street food drops!`
                      : 'Check in to stamp your passport, earn XP, and unlock street food drops.'}
                  </p>
                </div>
              </div>

              <div className="relative shrink-0 self-stretch sm:self-auto">
                <button
                  type="button"
                  id={`btn-modal-checkin-${market.id}`}
                  onClick={() => onCheckIn(market)}
                  className={`inline-flex w-full sm:w-auto items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm justify-center ${
                    isCheckedIn
                      ? 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      : isNearby
                      ? 'checkin-glow-pulse border border-amber-400 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-neutral-950 font-black ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/25'
                      : 'border border-amber-500/70 bg-amber-500 text-neutral-950 hover:bg-amber-400 font-extrabold shadow-amber-500/20'
                  }`}
                >
                  <span>{isCheckedIn ? 'Re-visit Check In' : isNearby ? 'Nearby! Check In & Earn XP' : 'Check In & Stamp Passport'}</span>
                </button>

                {isNearby && !isCheckedIn && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-80" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-neutral-900" />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Address & Direct Navigation Bar */}
          <div className="rounded-xl border border-neutral-800/90 bg-neutral-900/60 p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {market.address || 'No complete address provided, please navigate using map.'}
                </p>
              </div>
              <button
                id="btn-copy-address"
                onClick={handleCopyAddress}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>

            {/* Travel Time & Distance Breakdown (From User's Location) */}
            {travelEstimate && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Navigation className="h-3 w-3 text-emerald-400" />
                    Estimated Travel From Your Location
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Road network & traffic calibrated
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Driving Choice */}
                  <button
                    type="button"
                    id="btn-mode-driving"
                    onClick={() => setNavMode('driving')}
                    className={`flex flex-col rounded-lg p-2.5 text-left border transition cursor-pointer ${
                      navMode === 'driving'
                        ? 'border-emerald-500/70 bg-emerald-500/15 shadow-sm ring-1 ring-emerald-500/30'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-200">
                        <Car className="h-3.5 w-3.5 text-emerald-400" />
                        Driving
                      </span>
                      {navMode === 'driving' && (
                        <span className="text-[10px] font-bold text-emerald-400">Selected</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-lg font-bold text-white">
                        {travelEstimate.formattedDrivingDuration}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({travelEstimate.formattedDrivingDistance})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      Evening market traffic & parking buffer
                    </span>
                  </button>

                  {/* Walking Choice */}
                  <button
                    type="button"
                    id="btn-mode-walking"
                    onClick={() => setNavMode('walking')}
                    className={`flex flex-col rounded-lg p-2.5 text-left border transition cursor-pointer ${
                      navMode === 'walking'
                        ? 'border-emerald-500/70 bg-emerald-500/15 shadow-sm ring-1 ring-emerald-500/30'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-200">
                        <Footprints className="h-3.5 w-3.5 text-emerald-400" />
                        Walking
                      </span>
                      {travelEstimate.isWalkable && (
                        <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-300">
                          Walkable
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-lg font-bold text-white">
                        {travelEstimate.formattedWalkingDuration}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({travelEstimate.formattedWalkingDistance})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      {travelEstimate.isWalkable ? 'Practical on foot' : 'Pedestrian walkways'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation App Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-800/60">
              <a
                id="btn-nav-gmaps"
                href={directions.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 py-2 px-3 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
              >
                <Navigation className="h-3.5 w-3.5 text-blue-400" />
                <span>Google Maps ({navMode === 'walking' ? 'Walk' : 'Drive'})</span>
              </a>

              <a
                id="btn-nav-waze"
                href={directions.waze}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 py-2 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                <span>Waze</span>
              </a>

              <a
                id="btn-nav-apple"
                href={directions.apple}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 py-2 px-3 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                <span>Apple Maps ({navMode === 'walking' ? 'Walk' : 'Drive'})</span>
              </a>
            </div>
          </div>

          {/* Real-time Weather Forecast & Visitor Planning */}
          <MarketWeatherWidget market={market} />

          {/* Community Rating & Interactive 1-5 Star System */}
          <div className="rounded-xl border border-neutral-800/90 bg-neutral-900/50 p-4">
            <StarRatingWidget
              ratingInfo={ratingInfo}
              onRate={(score) => onRate?.(market.id, score)}
              onClearRating={userRating ? () => onClearRating?.(market.id) : undefined}
              size="md"
              showBreakdown={true}
            />
          </div>

          {/* Description */}
          {market.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                About This Night Market
              </h4>
              <p className="mt-1.5 text-sm text-neutral-300 leading-relaxed">
                {market.description}
              </p>
            </div>
          )}

          {/* Operating Schedule */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Operating Schedule</span>
              </h4>
              <span className="text-xs text-emerald-400 font-medium">
                {openStatus.sublabel}
              </span>
            </div>

            <div className="mt-2 divide-y divide-neutral-800/80 rounded-xl border border-neutral-800 bg-neutral-900/40">
              {market.schedule && market.schedule.length > 0 ? (
                market.schedule.map((sched, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {sched.days.map((day) => (
                        <span
                          key={day}
                          className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30"
                        >
                          {DAY_NAMES[day].en}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      {sched.times.map((time, tIdx) => (
                        <div key={tIdx} className="text-neutral-200 font-medium text-xs sm:text-sm">
                          {time.start} - {time.end}
                          {time.note && (
                            <span className="ml-1.5 text-neutral-400 text-xs font-normal">
                              ({time.note})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-neutral-400">
                  Standard evening market schedule (5:00 PM - 10:00 PM)
                </div>
              )}
            </div>
          </div>

          {/* Amenities & Facilities */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Building className="h-3.5 w-3.5 text-emerald-400" />
              <span>Facilities & Amenities</span>
            </h4>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {/* Parking */}
              <div
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center ${
                  market.parking.available
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
                }`}
              >
                <Car className="h-5 w-5 mb-1 text-emerald-400" />
                <span className="text-xs font-semibold">Parking</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {market.parking.available ? 'Available' : 'Limited on street'}
                </span>
              </div>

              {/* Accessible Parking */}
              <div
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center ${
                  market.parking.accessible
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
                }`}
              >
                <Accessibility className="h-5 w-5 mb-1 text-blue-400" />
                <span className="text-xs font-semibold">Accessible Parking</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {market.parking.accessible ? 'Designated Bay' : 'No dedicated bay'}
                </span>
              </div>

              {/* Surau */}
              <div
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center ${
                  market.amenities.prayer_room
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
                }`}
              >
                <Building className="h-5 w-5 mb-1 text-emerald-400" />
                <span className="text-xs font-semibold">Surau</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {market.amenities.prayer_room ? 'Available nearby' : 'Nearest surau'}
                </span>
              </div>

              {/* Toilet */}
              <div
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center ${
                  market.amenities.toilet
                    ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
                }`}
              >
                <span className="h-5 text-sm font-bold text-teal-400 mb-1">WC</span>
                <span className="text-xs font-semibold">Restroom</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {market.amenities.toilet ? 'Public restroom' : 'Nearby shops'}
                </span>
              </div>
            </div>

            {market.parking.notes && (
              <p className="mt-2 text-xs text-neutral-400 italic">
                Parking Notes: {market.parking.notes}
              </p>
            )}
          </div>

          {/* Popular Street Food List */}
          {market.shop_list && market.shop_list.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <span>Popular Street Food</span>
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {market.shop_list.map((food, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                  >
                    <span>{food}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visitor Tips */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Info className="h-4 w-4" />
              <span>Visitor & Foodie Tips</span>
            </h4>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>Peak hours are usually between 6:30 PM - 8:30 PM. Arrive early for fresh hot snacks and convenient parking.</li>
              <li>Most vendors accept DuitNow QR, but carrying small cash bills (RM1, RM5, RM10) ensures fastest checkout.</li>
              <li>Remember to keep the area clean by disposing of skewers, cups, and paper wrappers in designated bins.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/80 px-5 py-3 sm:px-6">
          <button
            id="btn-report-incorrect-info"
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-300 transition py-1 focus:outline-hidden"
            title="Report wrong hours, relocated market, or incorrect details to admin alias"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400/80" />
            <span>Report Incorrect Info</span>
          </button>

          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700"
          >
            Close
          </button>
        </div>

        {/* Report Incorrect Info Modal */}
        <ReportIssueModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          market={market}
          onReportSubmitted={onReportSubmitted}
        />
      </div>
    </div>
  );
};
