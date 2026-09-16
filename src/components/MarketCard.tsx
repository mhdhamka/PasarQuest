import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Clock,
  Car,
  Heart,
  Share2,
  Check,
  Building,
  Accessibility,
  Star,
  Footprints,
  Navigation,
} from 'lucide-react';
import { Market, UserCoordinates, TravelMode } from '../types';
import {
  getMarketOpenStatus,
  calculateDistance,
  formatDistance,
  getTravelEstimate,
  getDirectionsUrls,
  getDefaultNavigationUrl,
} from '../utils/marketUtils';
import { getMarketRating } from '../utils/ratingUtils';
import { DAY_NAMES } from '../utils/constants';

interface MarketCardProps {
  market: Market;
  index?: number;
  isSelected: boolean;
  onSelect: (market: Market) => void;
  onOpenDetails: (market: Market) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  userRating?: number;
  onRate?: (marketId: string, rating: number) => void;
  userLocation: UserCoordinates | null;
  travelMode?: TravelMode;
  isCheckedIn?: boolean;
  onCheckIn?: (market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  index,
  isSelected,
  onSelect,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  userRating,
  onRate,
  userLocation,
  travelMode = 'driving',
  isCheckedIn = false,
  onCheckIn,
}) => {
  const openStatus = getMarketOpenStatus(market);
  const [copied, setCopied] = useState(false);

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

  // Within 3km proximity to trigger the subtle XP check-in nudge
  const isNearby = distanceKm !== null && distanceKm <= 3.0;

  const directions = getDirectionsUrls(market, travelMode, userLocation);
  const defaultNavigationUrl = getDefaultNavigationUrl(market, userLocation, travelMode);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: market.name,
          text: `Night Market ${market.name} in ${market.district}, ${market.state}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${market.name} - ${market.address} (${market.location.gmaps_link || ''})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(market.id);
  };

  const ratingInfo = getMarketRating(market, userRating);

  return (
    <motion.div
      id={`card-market-${market.id}`}
      layout="position"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        delay: typeof index === 'number' ? Math.min(index * 0.03, 0.24) : 0,
      }}
      whileHover={{
        scale: 1.02,
        y: -3,
        transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(market)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-colors duration-200 cursor-pointer hover:shadow-xl hover:shadow-black/50 ${
        isSelected
          ? 'border-emerald-500 bg-neutral-900 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
          : 'border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
      }`}
    >
      {/* Top Header: Status Badge, Distance & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                openStatus.status === 'open'
                  ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : openStatus.status === 'opening-soon'
                  ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
                  : 'border border-neutral-700/60 bg-neutral-800 text-neutral-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  openStatus.status === 'open'
                    ? 'bg-emerald-400'
                    : openStatus.status === 'opening-soon'
                    ? 'bg-amber-400'
                    : 'bg-neutral-500'
                }`}
              />
              <span>{openStatus.label}</span>
            </span>

            {travelEstimate && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-neutral-800/90 px-2 py-0.5 text-[11px] font-medium text-neutral-200 border border-neutral-700 shadow-xs"
                title={`Drive: ${travelEstimate.formattedDrivingDuration} (${travelEstimate.formattedDrivingDistance}) • Walk: ${travelEstimate.formattedWalkingDuration} (${travelEstimate.formattedWalkingDistance})`}
              >
                {travelMode === 'walking' ? (
                  <>
                    <Footprints className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-300">
                      {travelEstimate.formattedWalkingDuration}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">
                      {travelEstimate.formattedWalkingDistance}
                    </span>
                  </>
                ) : (
                  <>
                    <Car className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-300">
                      {travelEstimate.formattedDrivingDuration}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">
                      {travelEstimate.formattedDrivingDistance}
                    </span>
                  </>
                )}
              </span>
            )}

            {travelEstimate && travelEstimate.isWalkable && travelMode !== 'walking' && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30"
                title={`Walkable: ${travelEstimate.formattedWalkingDuration} (${travelEstimate.formattedWalkingDistance})`}
              >
                <Footprints className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{travelEstimate.formattedWalkingDuration}</span>
              </span>
            )}

            {market.isUserAdded && (
              <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                Community
              </span>
            )}
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1">
            <button
              id={`btn-share-${market.id}`}
              onClick={handleShare}
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              title={copied ? 'Copied' : 'Share'}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              id={`btn-favorite-${market.id}`}
              onClick={handleFavorite}
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-rose-400"
              title="Favorites"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title & Location */}
        <div className="mt-2.5">
          <h3 className="font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
            {market.name}
          </h3>
          <p className="mt-0.5 flex items-start gap-1 text-xs text-neutral-400 line-clamp-1">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/80" />
            <span>
              {market.district ? `${market.district}, ` : ''}
              {market.state}
            </span>
          </p>
        </div>

        {/* Rating Badge & Quick 1-5 Star Bar */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 rounded-md bg-neutral-800/90 px-2 py-0.5 border border-neutral-700/80 shadow-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-neutral-100">{ratingInfo.average.toFixed(1)}</span>
              <span className="text-[10px] text-neutral-400">({ratingInfo.count})</span>
            </div>

            {ratingInfo.isCommunityFavorite && (
              <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                ★ Top Spot
              </span>
            )}

            {ratingInfo.userRating && (
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                You: {ratingInfo.userRating}★
              </span>
            )}
          </div>

          {/* Quick Click-to-Rate 1-5 Stars */}
          {onRate && (
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
              title={
                ratingInfo.userRating
                  ? `Your rating: ${ratingInfo.userRating}★ (Click to update)`
                  : 'Rate 1-5 stars'
              }
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRate(market.id, star)}
                  className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                  title={`${star} ★`}
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`h-3 w-3 transition-colors ${
                      star <= (ratingInfo.userRating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-600 hover:text-amber-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sublabel: Hours details */}
        <p className="mt-2 text-xs font-medium text-neutral-300 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{openStatus.sublabel}</span>
        </p>

        {/* Operating Days Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {market.schedule.map((sched, idx) => (
            <div key={idx} className="flex flex-wrap gap-1">
              {sched.days.map((day) => (
                <span
                  key={day}
                  className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-300 border border-neutral-700/60"
                >
                  {DAY_NAMES[day].shortEn}
                </span>
              ))}
            </div>
          ))}
          {market.total_shop && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
              ~{market.total_shop} stalls
            </span>
          )}
        </div>

        {/* Popular Foods Preview */}
        {market.shop_list && market.shop_list.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {market.shop_list.slice(0, 3).map((food, idx) => (
              <span
                key={idx}
                className="rounded-full bg-neutral-950/80 px-2 py-0.5 text-[10px] font-medium text-neutral-300 border border-neutral-800"
              >
                {food}
              </span>
            ))}
            {market.shop_list.length > 3 && (
              <span className="rounded-full bg-neutral-950/80 px-1.5 py-0.5 text-[10px] text-neutral-400 border border-neutral-800">
                +{market.shop_list.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Amenities Icons & Navigation Action */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-800/80 pt-3">
        {/* Amenities Mini Badges */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          {market.parking.available && (
            <span className="flex items-center gap-1 text-[11px]" title="Parking Available">
              <Car className="h-3.5 w-3.5 text-emerald-400" />
            </span>
          )}
          {market.parking.accessible && (
            <span className="flex items-center gap-1 text-[11px]" title="Accessible Parking Available">
              <Accessibility className="h-3.5 w-3.5 text-blue-400" />
            </span>
          )}
          {market.amenities.prayer_room && (
            <span className="flex items-center gap-1 text-[11px]" title="Prayer Room (Surau)">
              <Building className="h-3.5 w-3.5 text-emerald-400" />
            </span>
          )}
          {market.amenities.toilet && (
            <span className="flex items-center gap-1 text-[11px]" title="Restroom Available">
              <span className="text-[11px] font-bold text-teal-400">WC</span>
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          {onCheckIn && (
            <button
              id={`btn-checkin-${market.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(market);
              }}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                isCheckedIn
                  ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : isNearby
                  ? 'checkin-glow-pulse border-amber-400 bg-amber-500/25 text-amber-200 hover:bg-amber-500/35 hover:border-amber-300 ring-1 ring-amber-400/50'
                  : 'border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400'
              }`}
              title={
                isCheckedIn
                  ? 'Checked in! Stamp in passport'
                  : isNearby
                  ? `You're close (${distanceKm ? distanceKm.toFixed(1) + ' km' : 'nearby'})! Check in now to earn XP`
                  : 'Check in to earn XP & street food drop'
              }
            >
              {isNearby && !isCheckedIn && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-80" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-neutral-900" />
                </span>
              )}

              {isCheckedIn ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Stamped</span>
                </>
              ) : (
                <>
                  <span>Check In</span>
                </>
              )}
            </button>
          )}

          <a
            id={`btn-navigate-${market.id}`}
            href={defaultNavigationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30 hover:text-emerald-200 hover:border-emerald-500/70 shadow-xs"
            title={`Navigate from your location to ${market.name} in your default map app`}
          >
            <Navigation className="h-3.5 w-3.5 fill-emerald-400/20 text-emerald-400 shrink-0" />
            <span>Navigate</span>
          </a>

          <button
            id={`btn-details-${market.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(market);
            }}
            className="rounded-lg border border-neutral-700 bg-neutral-800/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};
