import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Droplets,
  Wind,
  Umbrella,
  RefreshCw,
  Search,
  ExternalLink,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';
import { Market, MarketWeatherForecast } from '../types';

interface MarketWeatherWidgetProps {
  market: Market;
}

// Memory cache to prevent redundant API calls during the session
const weatherCache = new Map<string, { data: MarketWeatherForecast; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const MarketWeatherWidget: React.FC<MarketWeatherWidgetProps> = ({ market }) => {
  const [weather, setWeather] = useState<MarketWeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchWeather = async (forceRefresh = false) => {
    const cacheKey = `${market.id}-${market.location.latitude}-${market.location.longitude}`;
    const cached = weatherCache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setWeather(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketName: market.name,
          district: market.district,
          state: market.state,
          latitude: market.location.latitude,
          longitude: market.location.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather forecast (HTTP ${response.status})`);
      }

      const data: MarketWeatherForecast = await response.json();
      weatherCache.set(cacheKey, { data, timestamp: Date.now() });
      setWeather(data);
    } catch (err: any) {
      console.error('Failed to load weather forecast:', err);
      setError(err?.message || 'Unable to retrieve forecast for this area');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [market.id, market.location.latitude, market.location.longitude]);

  const getWeatherIcon = (category: string) => {
    switch (category) {
      case 'clear':
        return <Sun className="h-7 w-7 text-amber-400" />;
      case 'cloudy':
        return <CloudSun className="h-7 w-7 text-sky-400" />;
      case 'rain':
        return <CloudRain className="h-7 w-7 text-blue-400" />;
      case 'thunderstorm':
        return <CloudLightning className="h-7 w-7 text-amber-300" />;
      case 'drizzle':
        return <CloudDrizzle className="h-7 w-7 text-teal-400" />;
      case 'haze':
        return <Wind className="h-7 w-7 text-neutral-400" />;
      default:
        return <Cloud className="h-7 w-7 text-neutral-400" />;
    }
  };

  const getRainRiskBadge = (rainChanceStr: string, category: string) => {
    const percent = parseInt(rainChanceStr, 10) || 0;
    if (category === 'thunderstorm' || percent >= 70) {
      return {
        label: 'High Rain Risk',
        color: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
        icon: ShieldAlert,
      };
    }
    if (category === 'rain' || category === 'drizzle' || percent >= 40) {
      return {
        label: 'Passing Showers Likely',
        color: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
        icon: Umbrella,
      };
    }
    return {
      label: 'Low Rain Risk',
      color: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      icon: Sun,
    };
  };

  return (
    <div
      id={`weather-widget-${market.id}`}
      className="rounded-xl border border-neutral-800/90 bg-neutral-900/60 p-4 space-y-3.5 transition-all"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CloudSun className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Area Weather Forecast
            </h4>
            <span className="text-[11px] text-neutral-400">
              Surrounding {market.district || market.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {weather?.isGoogleSearchGrounded && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300"
              title="Weather verified using live Google Search grounding"
            >
              <Search className="h-3 w-3 text-blue-400" />
              <span>Google Search Grounded</span>
            </span>
          )}

          <button
            type="button"
            id={`btn-refresh-weather-${market.id}`}
            onClick={() => fetchWeather(true)}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-[11px] font-medium text-neutral-300 transition hover:bg-neutral-700 hover:text-white disabled:opacity-50"
            title="Refresh current weather"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
            />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-800" />
              <div className="space-y-1.5">
                <div className="h-5 w-24 rounded bg-neutral-800" />
                <div className="h-3 w-32 rounded bg-neutral-800/60" />
              </div>
            </div>
            <div className="h-6 w-28 rounded bg-neutral-800/80" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 rounded-lg bg-neutral-800/50" />
            <div className="h-12 rounded-lg bg-neutral-800/50" />
            <div className="h-12 rounded-lg bg-neutral-800/50" />
          </div>
          <div className="h-12 rounded-lg bg-neutral-800/40" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && !weather && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-center space-y-2">
          <p className="text-xs text-neutral-400">
            Weather forecast temporarily unavailable for this coordinate.
          </p>
          <button
            type="button"
            onClick={() => fetchWeather(true)}
            className="rounded-md bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Weather Content */}
      {!loading && weather && (
        <div className="space-y-3">
          {/* Main Weather Metric & Status */}
          <div className="flex items-center justify-between bg-neutral-950/70 rounded-xl p-3 border border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800">
                {getWeatherIcon(weather.conditionCategory)}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {weather.temperature}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-300">
                    {weather.condition}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1">
                  {weather.forecastSummary}
                </p>
              </div>
            </div>

            {/* Risk Badge */}
            {(() => {
              const risk = getRainRiskBadge(weather.rainChance, weather.conditionCategory);
              const RiskIcon = risk.icon;
              return (
                <div
                  className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${risk.color}`}
                >
                  <RiskIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{risk.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Detailed Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 p-2 text-center">
              <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                <Droplets className="h-3 w-3 text-blue-400" />
                Rain Probability
              </span>
              <span className="mt-0.5 text-xs sm:text-sm font-bold text-neutral-200">
                {weather.rainChance}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 p-2 text-center">
              <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                <Thermometer className="h-3 w-3 text-amber-400" />
                Humidity
              </span>
              <span className="mt-0.5 text-xs sm:text-sm font-bold text-neutral-200">
                {weather.humidity}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 p-2 text-center">
              <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                <Wind className="h-3 w-3 text-teal-400" />
                Wind Speed
              </span>
              <span className="mt-0.5 text-xs sm:text-sm font-bold text-neutral-200">
                {weather.wind}
              </span>
            </div>
          </div>

          {/* Visitor Planning Advisory Callout */}
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 sm:p-3 text-xs">
            <div className="flex items-start gap-2">
              <Umbrella className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-emerald-300">
                  Pasar Malam Visit Tip:
                </span>{' '}
                <span className="text-neutral-300 leading-relaxed">
                  {weather.marketVisitTip}
                </span>
              </div>
            </div>
          </div>

          {/* Grounding Source Citations & Timestamp */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Updated: {weather.lastUpdated}</span>
              {weather.groundingSources && weather.groundingSources.length > 0 && (
                <>
                  <span>•</span>
                  <span>Sources:</span>
                  {weather.groundingSources.map((source, sIdx) => (
                    <a
                      key={sIdx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 hover:underline"
                      title={source.title}
                    >
                      <span>{source.title.length > 20 ? `${source.title.slice(0, 18)}…` : source.title}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </>
              )}
            </div>

            <span className="text-neutral-400">
              Evening forecast (5 PM – 10 PM)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
