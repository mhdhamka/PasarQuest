import rawMarketsData from './markets.json';
import { Market } from '../types';
import { getStoredUserMarkets } from '../utils/storage';

export function getAllMarkets(): Market[] {
  const userMarkets = getStoredUserMarkets();
  // Ensure typed market objects
  const defaultMarkets = (rawMarketsData as unknown as Market[]) || [];
  
  // Combine: user markets come first
  const existingIds = new Set(userMarkets.map((m) => m.id));
  const filteredDefaults = defaultMarkets.filter((m) => !existingIds.has(m.id));

  return [...userMarkets, ...filteredDefaults];
}
