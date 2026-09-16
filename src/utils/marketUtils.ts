import { Market, MarketOpenStatus, DayCode, UserCoordinates, FilterState, TravelMode, TravelEstimate } from '../types';
import { DAY_NAMES, DAY_CODES } from './constants';
import { getMarketRating } from './ratingUtils';

export function getMalaysiaNow(date?: Date): Date {
  const baseDate = date || new Date();
  const utcTime = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
  // Malaysia is UTC + 8 hours
  const mytTime = utcTime + 8 * 60 * 60000;
  return new Date(mytTime);
}

export function getDayCodeFromIndex(dayIndex: number): DayCode {
  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const map: Record<number, DayCode> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  return map[dayIndex] || 'mon';
}

function parseTimeToMinutes(time24: string): number {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

function weekdayIndex(code: DayCode): number {
  switch (code) {
    case 'sun': return 0;
    case 'mon': return 1;
    case 'tue': return 2;
    case 'wed': return 3;
    case 'thu': return 4;
    case 'fri': return 5;
    case 'sat': return 6;
  }
}

export function getMarketOpenStatus(market: Market, customNow?: Date): MarketOpenStatus {
  const localNow = getMalaysiaNow(customNow);
  const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
  const currentDayIndex = localNow.getDay(); // 0=Sun, 1=Mon, etc.

  type Range = { day: number; start: number; end: number; startStr: string; endStr: string };
  const ranges: Range[] = [];

  for (const sched of market.schedule || []) {
    for (const dayCode of sched.days || []) {
      const dayIdx = weekdayIndex(dayCode);
      for (const time of sched.times || []) {
        const start = parseTimeToMinutes(time.start);
        const end = parseTimeToMinutes(time.end);
        if (end >= start) {
          ranges.push({ day: dayIdx, start, end, startStr: time.start, endStr: time.end });
        } else {
          // overnight
          ranges.push({ day: dayIdx, start, end: 24 * 60, startStr: time.start, endStr: time.end });
          ranges.push({ day: (dayIdx + 1) % 7, start: 0, end, startStr: time.start, endStr: time.end });
        }
      }
    }
  }

  // Check if currently open
  const openSlot = ranges.find(
    (r) => r.day === currentDayIndex && currentMinutes >= r.start && currentMinutes < r.end
  );

  if (openSlot) {
    const minutesLeft = openSlot.end - currentMinutes;
    const hours = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      status: 'open',
      label: 'Open Now',
      sublabel: `Closes at ${openSlot.endStr} (${timeStr} left)`,
      minutesUntilClose: minutesLeft,
    };
  }

  // Check if opening soon today (within 120 minutes)
  const upcomingToday = ranges.find(
    (r) => r.day === currentDayIndex && currentMinutes < r.start && r.start - currentMinutes <= 120
  );

  if (upcomingToday) {
    const minutesUntil = upcomingToday.start - currentMinutes;
    return {
      status: 'opening-soon',
      label: 'Opening Soon',
      sublabel: `Opens at ${upcomingToday.startStr} (in ${minutesUntil}m)`,
      minutesUntilNextOpen: minutesUntil,
    };
  }

  // Find next opening slot across the week
  let bestDelta = Infinity;
  let nextRange: Range | null = null;

  for (let delta = 0; delta < 7; delta++) {
    const testDay = (currentDayIndex + delta) % 7;
    for (const r of ranges) {
      if (r.day !== testDay) continue;
      if (delta === 0 && r.start <= currentMinutes) continue;
      const candidateDelta = delta * 24 * 60 + (r.start - (delta === 0 ? currentMinutes : 0));
      if (candidateDelta >= 0 && candidateDelta < bestDelta) {
        bestDelta = candidateDelta;
        nextRange = r;
      }
    }
  }

  if (nextRange) {
    const nextDayCode = getDayCodeFromIndex(nextRange.day);
    const dayName = DAY_NAMES[nextDayCode].en;
    const isTomorrow = (currentDayIndex + 1) % 7 === nextRange.day;

    const dayText = isTomorrow ? `Tomorrow (${dayName})` : dayName;

    return {
      status: 'closed',
      label: 'Closed',
      sublabel: `Opens ${dayText}, ${nextRange.startStr}`,
      minutesUntilNextOpen: bestDelta,
    };
  }

  return {
    status: 'closed',
    label: 'Closed',
    sublabel: 'Check schedule',
  };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated driving road network distance from geodesic (straight-line) km.
 * Calibrated against Malaysian urban and suburban road circuity factors:
 * - Neighborhoods (< 1.5 km): local roads, cul-de-sacs, one-ways, U-turns (~1.38x)
 * - City / arterials (1.5 - 10 km): main corridors and flyovers (~1.32x)
 * - Expressways (10 - 35 km): connected highway routes (~1.26x)
 * - Interstate (> 35 km): major interstate highways (~1.22x)
 */
export function getAccurateDrivingDistance(straightKm: number): number {
  if (!straightKm || straightKm <= 0) return 0;
  let factor = 1.32;
  if (straightKm <= 1.5) {
    factor = 1.38;
  } else if (straightKm <= 10) {
    factor = 1.32;
  } else if (straightKm <= 35) {
    factor = 1.26;
  } else {
    factor = 1.22;
  }
  return Number((straightKm * factor).toFixed(2));
}

/**
 * Calculates estimated walking distance for pedestrians.
 * Pedestrians can use walkways, pedestrian bridges, and pathways (~1.18x to 1.25x).
 */
export function getAccurateWalkingDistance(straightKm: number): number {
  if (!straightKm || straightKm <= 0) return 0;
  const factor = straightKm <= 2 ? 1.2 : 1.25;
  return Number((straightKm * factor).toFixed(2));
}

/**
 * Calculates realistic driving travel duration during evening market rush (4:30 PM - 10:30 PM).
 * Accounts for traffic signals, evening congestion, and market perimeter parking deceleration:
 * - Short trips (<= 3 km): 22 km/h avg + 2 min buffer
 * - Medium trips (3 - 10 km): 34 km/h avg + 2 min buffer
 * - Expressway trips (10 - 30 km): 55 km/h avg + 2 min buffer
 * - Long distance (> 30 km): 75 km/h avg
 */
export function calculateDrivingDuration(roadDistanceKm: number): number {
  if (!roadDistanceKm || roadDistanceKm <= 0) return 0;
  let minutes = 0;
  if (roadDistanceKm <= 3) {
    minutes = (roadDistanceKm / 22) * 60 + 2;
  } else if (roadDistanceKm <= 10) {
    minutes = (3 / 22) * 60 + ((roadDistanceKm - 3) / 34) * 60 + 2;
  } else if (roadDistanceKm <= 30) {
    minutes = (3 / 22) * 60 + (7 / 34) * 60 + ((roadDistanceKm - 10) / 55) * 60 + 2;
  } else {
    minutes =
      (3 / 22) * 60 +
      (7 / 34) * 60 +
      (20 / 55) * 60 +
      ((roadDistanceKm - 30) / 75) * 60 +
      2;
  }
  return Math.max(1, Math.round(minutes));
}

/**
 * Calculates realistic walking travel duration.
 * Uses average pedestrian speed of 4.6 km/h (~13 minutes per km), accounting for crosswalks.
 */
export function calculateWalkingDuration(walkingDistanceKm: number): number {
  if (!walkingDistanceKm || walkingDistanceKm <= 0) return 0;
  const minutes = (walkingDistanceKm / 4.6) * 60;
  return Math.max(1, Math.round(minutes));
}

export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMins} min`;
}

/**
 * Returns full travel estimate including straight-line, driving road distance,
 * walking distance, and estimated travel times.
 */
export function getTravelEstimate(
  userLat: number,
  userLon: number,
  destLat: number,
  destLon: number
): TravelEstimate {
  const straightDistanceKm = calculateDistance(userLat, userLon, destLat, destLon);
  const drivingDistanceKm = getAccurateDrivingDistance(straightDistanceKm);
  const walkingDistanceKm = getAccurateWalkingDistance(straightDistanceKm);
  const drivingDurationMinutes = calculateDrivingDuration(drivingDistanceKm);
  const walkingDurationMinutes = calculateWalkingDuration(walkingDistanceKm);
  const isWalkable = walkingDistanceKm <= 2.0;

  return {
    straightDistanceKm,
    drivingDistanceKm,
    walkingDistanceKm,
    drivingDurationMinutes,
    walkingDurationMinutes,
    formattedDrivingDistance: formatDistance(drivingDistanceKm),
    formattedWalkingDistance: formatDistance(walkingDistanceKm),
    formattedDrivingDuration: formatDuration(drivingDurationMinutes),
    formattedWalkingDuration: formatDuration(walkingDurationMinutes),
    isWalkable,
  };
}

/**
 * Detects whether the user is on an Apple device (iOS / iPadOS / macOS)
 * to target Apple Maps as the system default navigation handler.
 */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) &&
    !('MSStream' in window)
  );
}

/**
 * Returns the navigation URL that launches the user's default map application
 * with directions set from their current location to the market's coordinates.
 */
export function getDefaultNavigationUrl(
  market: Market,
  userLocation?: UserCoordinates | null,
  mode: TravelMode | string = 'driving'
): string {
  const destLat = market.location.latitude;
  const destLng = market.location.longitude;
  const travelMode = mode === 'walking' ? 'walking' : 'driving';
  const hasUserCoords =
    userLocation &&
    Number.isFinite(userLocation.lat) &&
    Number.isFinite(userLocation.lng);

  if (isAppleDevice()) {
    // Apple Maps URL scheme configured for directions from current location
    const saddr = hasUserCoords
      ? `${userLocation.lat},${userLocation.lng}`
      : 'Current+Location';
    const dirflg = travelMode === 'walking' ? 'w' : 'd';
    return `https://maps.apple.com/?saddr=${saddr}&daddr=${destLat},${destLng}&dirflg=${dirflg}`;
  }

  // Google Maps Universal URL scheme with origin set to user's location & destination to market coordinates
  const originParam = hasUserCoords
    ? `&origin=${userLocation.lat},${userLocation.lng}`
    : '';
  const title = encodeURIComponent(market.name);
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${title}${originParam}&travelmode=${travelMode}`;
}

export function getDirectionsUrls(
  market: Market,
  mode: TravelMode | string = 'driving',
  userLocation?: UserCoordinates | null
) {
  const lat = market.location.latitude;
  const lng = market.location.longitude;
  const title = encodeURIComponent(market.name);
  const travelMode = mode === 'walking' ? 'walking' : 'driving';
  const hasUserCoords =
    userLocation &&
    Number.isFinite(userLocation.lat) &&
    Number.isFinite(userLocation.lng);

  const googleOriginParam = hasUserCoords
    ? `&origin=${userLocation.lat},${userLocation.lng}`
    : '';
  const appleSaddr = hasUserCoords
    ? `${userLocation.lat},${userLocation.lng}`
    : 'Current+Location';

  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${title}${googleOriginParam}&travelmode=${travelMode}`,
    googleDriving: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${title}${googleOriginParam}&travelmode=driving`,
    googleWalking: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${title}${googleOriginParam}&travelmode=walking`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    apple: `https://maps.apple.com/?saddr=${appleSaddr}&daddr=${lat},${lng}&dirflg=${travelMode === 'walking' ? 'w' : 'd'}`,
  };
}

export function filterAndSortMarkets(
  markets: Market[],
  filter: FilterState,
  searchQuery: string,
  userLocation: UserCoordinates | null,
  favoriteIds: Set<string>,
  userRatings: Record<string, number> = {}
): { markets: Market[]; totalFound: number } {
  const now = getMalaysiaNow();
  const currentDayCode = getDayCodeFromIndex(now.getDay());
  const tomorrowDayCode = getDayCodeFromIndex((now.getDay() + 1) % 7);

  const query = searchQuery.trim().toLowerCase();

  const filtered = markets.filter((market) => {
    // Favorites only
    if (filter.favoritesOnly && !favoriteIds.has(market.id)) {
      return false;
    }

    // Minimum rating filter
    if (filter.minRating && filter.minRating > 0) {
      const ratingInfo = getMarketRating(market, userRatings[market.id]);
      if (ratingInfo.average < filter.minRating) {
        return false;
      }
    }

    // State filter
    if (filter.state && filter.state !== 'All States') {
      if (market.state !== filter.state) {
        return false;
      }
    }

    // Day filter
    if (filter.day && filter.day !== 'all') {
      let targetDayCode: DayCode | null = null;
      if (filter.day === 'today') {
        targetDayCode = currentDayCode;
      } else if (filter.day === 'tomorrow') {
        targetDayCode = tomorrowDayCode;
      } else if (DAY_CODES.includes(filter.day as DayCode)) {
        targetDayCode = filter.day as DayCode;
      } else {
        // match by name
        const matchEntry = Object.entries(DAY_NAMES).find(
          ([, v]) => v.en.toLowerCase() === filter.day.toLowerCase()
        );
        if (matchEntry) {
          targetDayCode = matchEntry[0] as DayCode;
        }
      }

      if (targetDayCode) {
        const hasDay = market.schedule.some((s) => s.days.includes(targetDayCode!));
        if (!hasDay) return false;
      }
    }

    // Open Now filter
    if (filter.openNow) {
      const openStatus = getMarketOpenStatus(market, now);
      if (openStatus.status !== 'open') {
        return false;
      }
    }

    // Food filter
    if (filter.food && filter.food !== 'all') {
      const foodMatch = market.shop_list?.some((food) =>
        food.toLowerCase().includes(filter.food.toLowerCase())
      );
      if (!foodMatch) return false;
    }

    // Amenities
    if (filter.hasToilet && !market.amenities.toilet) return false;
    if (filter.hasSurau && !market.amenities.prayer_room) return false;
    if (filter.hasParking && !market.parking.available) return false;
    if (filter.hasAccessibleParking && !market.parking.accessible) return false;

    // Search query: match name, district, address, state, or food tags
    if (query) {
      const nameMatch = market.name.toLowerCase().includes(query);
      const districtMatch = market.district.toLowerCase().includes(query);
      const addressMatch = market.address.toLowerCase().includes(query);
      const stateMatch = market.state.toLowerCase().includes(query);
      const foodMatch = market.shop_list?.some((item) => item.toLowerCase().includes(query));

      if (!nameMatch && !districtMatch && !addressMatch && !stateMatch && !foodMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    // User added markets stay high if recent
    if (a.isUserAdded && !b.isUserAdded) return -1;
    if (!a.isUserAdded && b.isUserAdded) return 1;

    // Community rating sort
    if (filter.sortBy === 'rating') {
      const ratingA = getMarketRating(a, userRatings[a.id]);
      const ratingB = getMarketRating(b, userRatings[b.id]);
      if (ratingB.average !== ratingA.average) {
        return ratingB.average - ratingA.average;
      }
      return ratingB.count - ratingA.count;
    }

    // Distance sort: accurately calculates walking or driving distance & time from user location
    if (filter.sortBy === 'distance' && userLocation) {
      const mode = filter.travelMode || 'driving';
      const estA = getTravelEstimate(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude);
      const estB = getTravelEstimate(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude);

      if (mode === 'walking') {
        const diff = estA.walkingDistanceKm - estB.walkingDistanceKm;
        if (Math.abs(diff) > 0.05) return diff;
        return estA.walkingDurationMinutes - estB.walkingDurationMinutes;
      }

      // Default: Driving road network distance & time
      const diff = estA.drivingDistanceKm - estB.drivingDistanceKm;
      if (Math.abs(diff) > 0.05) return diff;
      return estA.drivingDurationMinutes - estB.drivingDurationMinutes;
    }

    // Smart sort: Open now first, then opening soon, then nearest road distance (if location available), else stall count
    if (filter.sortBy === 'smart') {
      const statusA = getMarketOpenStatus(a, now);
      const statusB = getMarketOpenStatus(b, now);

      const statusWeight: Record<string, number> = {
        open: 1,
        'opening-soon': 2,
        closed: 3,
      };

      const diff = statusWeight[statusA.status] - statusWeight[statusB.status];
      if (diff !== 0) return diff;

      // If both same status and user location is available, sort by accurate travel distance
      if (userLocation) {
        const mode = filter.travelMode || 'driving';
        const estA = getTravelEstimate(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude);
        const estB = getTravelEstimate(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude);
        if (mode === 'walking') {
          return estA.walkingDistanceKm - estB.walkingDistanceKm;
        }
        return estA.drivingDistanceKm - estB.drivingDistanceKm;
      }

      // Otherwise stall count
      return (b.total_shop || 0) - (a.total_shop || 0);
    }

    // Shops sort
    if (filter.sortBy === 'shops') {
      return (b.total_shop || 0) - (a.total_shop || 0);
    }

    // Name alphabetical
    if (filter.sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }

    return 0;
  });

  return { markets: sorted, totalFound: sorted.length };
}
