import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Market, UserCoordinates, TravelMode } from '../types';
import {
  getMarketOpenStatus,
  calculateDistance,
  formatDistance,
  getTravelEstimate,
  getDirectionsUrls,
} from '../utils/marketUtils';
import { getMarketRating } from '../utils/ratingUtils';
import { MALAYSIA_CENTER } from '../utils/constants';
import { Compass, Navigation } from 'lucide-react';

interface MarketMapProps {
  markets: Market[];
  selectedMarket: Market | null;
  onSelectMarket: (market: Market) => void;
  userLocation: UserCoordinates | null;
  onOpenDetails: (market: Market) => void;
  userRatings?: Record<string, number>;
  travelMode?: TravelMode;
}

export const MarketMap: React.FC<MarketMapProps> = ({
  markets,
  selectedMarket,
  onSelectMarket,
  userLocation,
  onOpenDetails,
  userRatings = {},
  travelMode = 'driving',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasCenteredOnUser = useRef(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [MALAYSIA_CENTER.lat, MALAYSIA_CENTER.lng],
      zoom: MALAYSIA_CENTER.defaultZoom,
      zoomControl: false,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer group for market markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (
      userLocation &&
      Number.isFinite(Number(userLocation.lat)) &&
      Number.isFinite(Number(userLocation.lng))
    ) {
      const uLat = Number(userLocation.lat);
      const uLng = Number(userLocation.lng);

      const userHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-8 w-8 rounded-full bg-blue-500/30 animate-ping"></span>
          <span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg">
            <span class="h-2 w-2 rounded-full bg-white"></span>
          </span>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([uLat, uLng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Auto-center map on user location once upon initial fetch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || hasCenteredOnUser.current) return;

    const lat = Number(userLocation.lat);
    const lng = Number(userLocation.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], 13, {
        duration: 1.2,
      });
      hasCenteredOnUser.current = true;
    }
  }, [userLocation]);

  // Update market markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Display up to 250 closest / filtered
    const visibleMarkets = markets.slice(0, 250);

    visibleMarkets.forEach((market) => {
      const lat = Number(market?.location?.latitude);
      const lng = Number(market?.location?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const openStatus = getMarketOpenStatus(market);
      const isSelected = selectedMarket?.id === market.id;

      let markerColorClass = 'bg-neutral-600 border-neutral-400';
      let pulseRing = '';

      if (openStatus.status === 'open') {
        markerColorClass = 'bg-emerald-500 border-white text-neutral-950 shadow-emerald-500/50 shadow-lg';
        pulseRing = '<span class="absolute -inset-1 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>';
      } else if (openStatus.status === 'opening-soon') {
        markerColorClass = 'bg-amber-500 border-white text-neutral-950 shadow-amber-500/50 shadow-lg';
        pulseRing = '<span class="absolute -inset-1 rounded-full bg-amber-400 opacity-50 animate-pulse"></span>';
      }

      const selectedClass = isSelected ? 'scale-125 ring-4 ring-emerald-400 ring-offset-2 ring-offset-neutral-900 z-50' : '';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${selectedClass}">
          ${pulseRing}
          <div class="relative flex h-7 w-7 items-center justify-center rounded-full border-2 ${markerColorClass}">
            <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-market-pin',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const markerInstance = L.marker([lat, lng], {
        icon: customIcon,
      });

      const travelEstimate =
        userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)
          ? getTravelEstimate(userLocation.lat, userLocation.lng, lat, lng)
          : null;

      const directions = getDirectionsUrls(market, travelMode, userLocation);
      const ratingInfo = getMarketRating(market, userRatings[market.id]);

      const statusBadge =
        openStatus.status === 'open'
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● Open Now</span>'
          : openStatus.status === 'opening-soon'
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">◐ Opening Soon</span>'
          : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">○ Closed</span>';

      const travelBadge = travelEstimate
        ? travelMode === 'walking'
          ? `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700"> ${travelEstimate.formattedWalkingDuration} <span class="text-neutral-500">•</span> <span class="text-neutral-400">${travelEstimate.formattedWalkingDistance}</span></span>`
          : `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700"> ${travelEstimate.formattedDrivingDuration} <span class="text-neutral-500">•</span> <span class="text-neutral-400">${travelEstimate.formattedDrivingDistance}</span></span>`
        : '';

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 space-y-2 max-w-[260px] text-neutral-100';
      popupContent.innerHTML = `
        <div class="flex items-start justify-between gap-1">
          <div>
            <h4 class="font-bold text-sm text-white leading-tight">${market.name}</h4>
            <p class="text-xs text-neutral-400 mt-0.5">${market.district}, ${market.state}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 pt-0.5 flex-wrap">
          ${statusBadge}
          <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ★ ${ratingInfo.average.toFixed(1)} (${ratingInfo.count})
          </span>
          ${travelBadge}
        </div>
        <p class="text-[11px] text-neutral-300 line-clamp-1 border-t border-neutral-800 pt-1.5">${openStatus.sublabel}</p>
        <div class="flex items-center gap-1.5 pt-1">
          <a href="${directions.google}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-1.5 px-2 text-[11px] font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700">
            Google Maps
          </a>
          <a href="${directions.waze}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-1.5 px-2 text-[11px] font-semibold rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40">
            Waze
          </a>
        </div>
      `;

      // Add detail button
      const detailBtn = document.createElement('button');
      detailBtn.className = 'w-full mt-1.5 py-1 px-2 text-[11px] font-semibold rounded bg-neutral-700 hover:bg-neutral-600 text-white text-center';
      detailBtn.innerText = 'View Details';
      detailBtn.onclick = () => {
        onOpenDetails(market);
      };
      popupContent.appendChild(detailBtn);

      markerInstance.bindPopup(popupContent);

      markerInstance.on('click', () => {
        onSelectMarket(market);
      });

      layer.addLayer(markerInstance);
    });
  }, [markets, selectedMarket, userLocation]);

  // Center on selected market if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMarket?.location) return;

    const lat = Number(selectedMarket.location.latitude);
    const lng = Number(selectedMarket.location.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.flyTo([lat, lng], 14, {
      duration: 1.2,
    });
  }, [selectedMarket]);

  const handleRecenterMalaysia = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = Number.isFinite(Number(MALAYSIA_CENTER.lat)) ? Number(MALAYSIA_CENTER.lat) : 4.2105;
    const lng = Number.isFinite(Number(MALAYSIA_CENTER.lng)) ? Number(MALAYSIA_CENTER.lng) : 101.9758;
    map.flyTo([lat, lng], MALAYSIA_CENTER.defaultZoom || 7, {
      duration: 1,
    });
  };

  const handleCenterUserLocation = () => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    const lat = Number(userLocation.lat);
    const lng = Number(userLocation.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.flyTo([lat, lng], 13, {
      duration: 1,
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-neutral-800 shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Map Controls */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1.5">
        <button
          id="btn-map-recenter-my"
          onClick={handleRecenterMalaysia}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 shadow-lg backdrop-blur-sm transition hover:bg-neutral-800 hover:text-white"
          title="Recenter Map"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-400" />
          <span>All Malaysia</span>
        </button>

        {userLocation && (
          <button
            id="btn-map-center-user"
            onClick={handleCenterUserLocation}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-sm transition hover:bg-emerald-900/80"
            title="Center My Location"
          >
            <Navigation className="h-3.5 w-3.5 text-emerald-400" />
            <span>My Location</span>
          </button>
        )}
      </div>

      {/* Map Badge Info */}
      <div className="pointer-events-none absolute top-3 left-3 z-[400] rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-medium text-neutral-400 backdrop-blur-sm">
        Map View • {markets.length} locations
      </div>
    </div>
  );
};