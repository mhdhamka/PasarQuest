import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md border border-amber-400/30 px-3 py-2 text-xs font-semibold text-neutral-950 shadow-xl animate-in slide-in-from-bottom"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-neutral-950" />
      <span>Offline Mode — Cached markets & Pasar Dex available.</span>
    </div>
  );
};
