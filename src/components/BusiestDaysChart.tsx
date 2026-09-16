import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Market, DayCode } from '../types';
import { DAY_CODES, DAY_NAMES } from '../utils/constants';
import { getMalaysiaNow } from '../utils/marketUtils';
import { ChevronDown, ChevronUp, Store, Users, Calendar } from 'lucide-react';

interface BusiestDaysChartProps {
  markets: Market[];
  allMarkets: Market[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

type MetricType = 'markets' | 'shops';

interface DayData {
  dayCode: DayCode;
  name: string;
  shortName: string;
  marketCount: number;
  totalShops: number;
  percentage: number;
  isToday: boolean;
  isPeak: boolean;
  topStates: string[];
}

export const BusiestDaysChart: React.FC<BusiestDaysChartProps> = ({
  markets,
  allMarkets,
  selectedDay,
  onSelectDay,
}) => {
  const [metric, setMetric] = useState<MetricType>('markets');
  const [scope, setScope] = useState<'current' | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Determine current day of week in Malaysia (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const mytDayCode = useMemo<DayCode>(() => {
    const myt = getMalaysiaNow();
    const dayMap: Record<number, DayCode> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    return dayMap[myt.getDay()] || 'sat';
  }, []);

  // Compute dataset based on selected scope
  const targetMarkets = scope === 'current' && markets.length > 0 ? markets : allMarkets;

  const chartData = useMemo<DayData[]>(() => {
    const totalCount = targetMarkets.length || 1;

    // Count by day
    const dayStats = DAY_CODES.map((code) => {
      let count = 0;
      let shopSum = 0;
      const stateDistribution: Record<string, number> = {};

      for (const m of targetMarkets) {
        const operatesOnDay = m.schedule?.some((s) => s.days.includes(code));
        if (operatesOnDay) {
          count++;
          shopSum += m.total_shop || 35;
          stateDistribution[m.state] = (stateDistribution[m.state] || 0) + 1;
        }
      }

      // Top 3 states
      const topStates = Object.entries(stateDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([st, c]) => `${st} (${c})`);

      return {
        dayCode: code,
        name: DAY_NAMES[code].en,
        shortName: DAY_NAMES[code].shortEn,
        marketCount: count,
        totalShops: shopSum,
        percentage: Math.round((count / totalCount) * 100),
        isToday: code === mytDayCode,
        isPeak: false,
        topStates,
      };
    });

    // Find peak
    const maxVal = Math.max(...dayStats.map((d) => (metric === 'markets' ? d.marketCount : d.totalShops)));
    dayStats.forEach((d) => {
      const val = metric === 'markets' ? d.marketCount : d.totalShops;
      if (val === maxVal && maxVal > 0) {
        d.isPeak = true;
      }
    });

    return dayStats;
  }, [targetMarkets, mytDayCode, metric]);

  const peakDay = useMemo(() => {
    return chartData.find((d) => d.isPeak) || chartData[0];
  }, [chartData]);

  const todayData = useMemo(() => {
    return chartData.find((d) => d.isToday);
  }, [chartData]);

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-sm shadow-xl mb-4 transition-all">
      {/* Top Header: Title, Metrics, Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-white">
                Busiest Days Analysis
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                <span>Aggregated Data</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Night market schedule distribution across {targetMarkets.length} locations
            </p>
          </div>
        </div>

        {/* Action Controls: Metric Switcher, Scope Toggle & Minimize */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Metric Switcher */}
          <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-0.5 text-xs">
            <button
              id="btn-metric-markets"
              onClick={() => setMetric('markets')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
                metric === 'markets'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Markets</span>
            </button>
            <button
              id="btn-metric-shops"
              onClick={() => setMetric('shops')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
                metric === 'shops'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Stalls</span>
            </button>
          </div>

          {/* Scope Switcher if search/filter is active */}
          {markets.length !== allMarkets.length && (
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-0.5 text-xs">
              <button
                onClick={() => setScope('all')}
                className={`rounded-lg px-2 py-1 font-medium transition ${
                  scope === 'all'
                    ? 'bg-neutral-800 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All ({allMarkets.length})
              </button>
              <button
                onClick={() => setScope('current')}
                className={`rounded-lg px-2 py-1 font-medium transition ${
                  scope === 'current'
                    ? 'bg-neutral-800 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Filtered ({markets.length})
              </button>
            </div>
          )}

          {/* Collapse/Expand */}
          <button
            id="btn-toggle-busiest-chart"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="pt-4 space-y-4">
          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Peak Day Card */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Busiest Peak Day
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-base font-bold text-white truncate">
                    {peakDay?.name}
                  </h4>
                  <span className="text-xs font-semibold text-emerald-300">
                    {metric === 'markets'
                      ? `${peakDay?.marketCount} markets`
                      : `~${peakDay?.totalShops?.toLocaleString()} stalls`}
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Activity Card */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Today (MYT)
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-base font-bold text-white truncate">
                    {todayData?.name}
                  </h4>
                  <span className="text-xs font-semibold text-emerald-300">
                    {metric === 'markets'
                      ? `${todayData?.marketCount} open markets`
                      : `~${todayData?.totalShops?.toLocaleString()} stalls`}
                  </span>
                </div>
              </div>
            </div>

            {/* Weekend vs Weekday summary */}
            <div className="hidden lg:flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Weekend Vibes (Fri - Sun)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-white">
                    {chartData
                      .filter((d) => ['fri', 'sat', 'sun'].includes(d.dayCode))
                      .reduce((acc, curr) => acc + (metric === 'markets' ? curr.marketCount : curr.totalShops), 0)
                      .toLocaleString()}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {metric === 'markets' ? 'active markets' : 'estimated stalls'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const item = e.activePayload[0].payload as DayData;
                    if (item?.dayCode) {
                      onSelectDay(item.dayCode);
                    }
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.07)"
                />
                <XAxis
                  dataKey="shortName"
                  stroke="#737373"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={({ x, y, payload }) => {
                    const dataItem = chartData.find((d) => d.shortName === payload.value);
                    const isToday = dataItem?.isToday;
                    const isSelected = selectedDay === dataItem?.dayCode;

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={16}
                          textAnchor="middle"
                          fill={
                            isSelected
                              ? '#f59e0b'
                              : isToday
                              ? '#10b981'
                              : '#a3a3a3'
                          }
                          fontSize={12}
                          fontWeight={isToday || isSelected ? '700' : '500'}
                        >
                          {payload.value}
                        </text>
                        {isToday && (
                          <circle cx={0} cy={24} r={2} fill="#10b981" />
                        )}
                      </g>
                    );
                  }}
                />
                <YAxis
                  stroke="#737373"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{ fontSize: 11, fill: '#737373' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as DayData;
                    return (
                      <div className="rounded-xl border border-neutral-700 bg-neutral-900/95 p-3 text-xs shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm">{data.name}</h4>
                            {data.isToday && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                                Today
                              </span>
                            )}
                            {data.isPeak && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                                Peak
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-neutral-300">
                          <p className="flex items-center justify-between gap-4">
                            <span className="text-neutral-400">Operating Markets:</span>
                            <span className="font-bold text-emerald-400 text-sm">
                              {data.marketCount} ({data.percentage}% of total)
                            </span>
                          </p>
                          <p className="flex items-center justify-between gap-4">
                            <span className="text-neutral-400">Est. Total Stalls:</span>
                            <span className="font-semibold text-neutral-100">
                              ~{data.totalShops.toLocaleString()}
                            </span>
                          </p>
                          {data.topStates.length > 0 && (
                            <div className="pt-1 border-t border-neutral-800/80">
                              <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                                Top Active States:
                              </span>
                              <p className="text-[11px] text-neutral-200 mt-0.5">
                                {data.topStates.join(', ')}
                              </p>
                            </div>
                          )}
                          <p className="text-[10px] text-emerald-400/80 pt-1 italic">
                            Click bar to filter market list to this day
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={metric === 'markets' ? 'marketCount' : 'totalShops'}
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                >
                  {chartData.map((entry) => {
                    const isSelected = selectedDay === entry.dayCode;
                    let fill = '#059669';

                    if (isSelected) {
                      fill = '#34d399';
                    } else if (entry.isPeak) {
                      fill = '#10b981';
                    } else if (entry.isToday) {
                      fill = '#047857';
                    } else {
                      fill = '#525252';
                    }

                    return (
                      <Cell
                        key={entry.dayCode}
                        fill={fill}
                        className="cursor-pointer transition-opacity hover:opacity-90"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Day Selector Chips Beneath Chart */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-neutral-800/60">
            <span className="text-[11px] text-neutral-400 shrink-0 mr-1 hidden sm:inline">
              Select Day:
            </span>
            <div className="flex items-center gap-1.5 w-full justify-between sm:justify-start">
              {chartData.map((d) => {
                const isSelected = selectedDay === d.dayCode;
                return (
                  <button
                    key={d.dayCode}
                    onClick={() => onSelectDay(isSelected ? 'all' : d.dayCode)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border border-emerald-500 bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                        : d.isToday
                        ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'border border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                    }`}
                  >
                    <span>{d.shortName}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                        isSelected
                          ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {d.marketCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
