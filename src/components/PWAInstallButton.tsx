import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition shadow-sm hover:border-emerald-400"
        title="Install Pasar Quest as Mobile / Desktop App"
      >
        <Download className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden xs:inline">Install App</span>
        <span className="xs:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit, guide user to Share > Add to Home Screen)
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios-install"
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-300 transition shadow-sm"
          title="Add Pasar Quest to your iPhone / iPad Home Screen"
        >
          <Smartphone className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden xs:inline">Install on iOS</span>
          <span className="xs:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="flex items-start gap-3 rounded-xl bg-neutral-950/60 p-3 border border-neutral-800">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-neutral-300">
                    <Share2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Step 1:</span> Tap the <strong className="text-amber-300">Share</strong> button on Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-neutral-950/60 p-3 border border-neutral-800">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-neutral-300">
                    <PlusSquare className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Step 2:</span> Scroll down and select <strong className="text-amber-300">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 text-center">
                  Pasar Quest will launch as a full-screen, standalone app with instant access and saved stamps!
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-bold text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: Always available manual button for desktop & other mobile browsers
  return (
    <button
      id="btn-pwa-generic-install"
      type="button"
      onClick={() => {
        // If browser hasn't fired prompt yet, provide friendly instruction modal or alert
        alert('To install Pasar Quest as an app on your device:\n\n• On Chrome / Edge: Click the install icon in the address bar.\n• On Android: Tap menu (⋮) and choose "Install app" or "Add to Home screen".\n• On iPhone: Tap Share and choose "Add to Home Screen".');
      }}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 transition"
      title="Install Pasar Quest as an App"
    >
      <Download className="h-3.5 w-3.5 text-neutral-400" />
      <span>Install App</span>
    </button>
  );
};
