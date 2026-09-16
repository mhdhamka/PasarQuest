export type DayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeSlot {
  start: string;
  end: string;
  note?: string;
}

export interface MarketSchedule {
  days: DayCode[];
  times: TimeSlot[];
}

export interface MarketLocation {
  latitude: number;
  longitude: number;
  gmaps_link?: string;
}

export interface MarketParking {
  available: boolean;
  accessible: boolean;
  notes?: string;
}

export interface MarketAmenities {
  toilet: boolean;
  prayer_room: boolean;
}

export interface Market {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Closed';
  description?: string;
  parking: MarketParking;
  amenities: MarketAmenities;
  total_shop?: number | null;
  location: MarketLocation;
  schedule: MarketSchedule[];
  shop_list?: string[];
  isUserAdded?: boolean;
}

export type OpenStatusType = 'open' | 'opening-soon' | 'closed';

export interface MarketOpenStatus {
  status: OpenStatusType;
  label: string;
  sublabel: string;
  closesAt?: Date;
  nextOpenAt?: Date;
  minutesUntilClose?: number;
  minutesUntilNextOpen?: number;
}

export type TravelMode = 'driving' | 'walking';

export interface TravelEstimate {
  straightDistanceKm: number;
  drivingDistanceKm: number;
  walkingDistanceKm: number;
  drivingDurationMinutes: number;
  walkingDurationMinutes: number;
  formattedDrivingDistance: string;
  formattedWalkingDistance: string;
  formattedDrivingDuration: string;
  formattedWalkingDuration: string;
  isWalkable: boolean;
}

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export type ViewMode = 'split' | 'list' | 'map';

export type SortOption = 'smart' | 'rating' | 'distance' | 'shops' | 'name-asc';

export interface FilterState {
  state: string;
  day: string; // 'all', 'today', 'tomorrow', or day code
  openNow: boolean;
  food: string;
  hasToilet: boolean;
  hasSurau: boolean;
  hasParking: boolean;
  hasAccessibleParking: boolean;
  favoritesOnly: boolean;
  minRating?: number;
  sortBy: SortOption;
  travelMode?: TravelMode;
}

export interface WeatherGroundingSource {
  title: string;
  uri: string;
}

export interface MarketWeatherForecast {
  condition: string;
  conditionCategory: 'clear' | 'cloudy' | 'rain' | 'thunderstorm' | 'drizzle' | 'haze';
  temperature: string;
  tempNumeric: number;
  rainChance: string;
  humidity: string;
  wind: string;
  precipitation?: string;
  forecastSummary: string;
  marketVisitTip: string;
  lastUpdated: string;
  isGoogleSearchGrounded: boolean;
  groundingSources: WeatherGroundingSource[];
  searchQuery?: string;
}

// Gamification: Pasar Dex & Foodie Passport
export type FoodRarity = 'common' | 'rare' | 'legendary';

export interface CollectibleFood {
  id: string;
  name: string;
  malayName?: string;
  category: 'street-food' | 'dessert' | 'drinks' | 'snack';
  rarity: FoodRarity;
  xpValue: number;
  description: string;
  tasteProfile: string;
  iconEmoji: string;
}

export interface UserCollectedFood {
  foodId: string;
  discoveredAt: string;
  marketId: string;
  marketName: string;
  count: number;
}

export interface MarketCheckIn {
  marketId: string;
  marketName: string;
  state: string;
  district: string;
  timestamp: string;
  dayOfWeek: number;
}

export interface BadgeAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'markets' | 'food' | 'explorer' | 'streak';
}

export interface GamificationProfile {
  totalXp: number;
  collectedFoods: Record<string, UserCollectedFood>;
  checkIns: MarketCheckIn[];
  unlockedBadges: string[];
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  type: 'check_in_count' | 'different_states' | 'evening_visit';
}


