import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { Market, DayCode } from '../types';
import { MALAYSIAN_STATES, DAY_NAMES, DAY_CODES } from '../utils/constants';
import { saveUserMarket } from '../utils/storage';

interface SuggestMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketAdded: (market: Market) => void;
}

export const SuggestMarketModal: React.FC<SuggestMarketModalProps> = ({
  isOpen,
  onClose,
  onMarketAdded,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [state, setState] = useState('Selangor');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(['sat']);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('22:00');
  const [hasParking, setHasParking] = useState(true);
  const [hasAccessibleParking, setHasAccessibleParking] = useState(false);
  const [hasToilet, setHasToilet] = useState(false);
  const [hasSurau, setHasSurau] = useState(true);
  const [foods, setFoods] = useState('Apam Balik, Ayam Gunting, Roti John, Air Balang');
  const [totalShop, setTotalShop] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleDay = (code: DayCode) => {
    setSelectedDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    // Generate approximate coordinate based on selected state center
    const stateCoords: Record<string, { lat: number; lng: number }> = {
      Selangor: { lat: 3.0738, lng: 101.5183 },
      'Kuala Lumpur': { lat: 3.139, lng: 101.6869 },
      Penang: { lat: 5.4141, lng: 100.3288 },
      'Pulau Pinang': { lat: 5.4141, lng: 100.3288 },
      Johor: { lat: 1.4927, lng: 103.7414 },
      Perak: { lat: 4.5975, lng: 101.0901 },
      Melaka: { lat: 2.1896, lng: 102.2501 },
      Kedah: { lat: 6.1184, lng: 100.3685 },
      'Negeri Sembilan': { lat: 2.7258, lng: 101.9424 },
      Pahang: { lat: 3.8126, lng: 103.3256 },
      Terengganu: { lat: 5.3117, lng: 103.1324 },
      Kelantan: { lat: 6.1254, lng: 102.2381 },
      Sabah: { lat: 5.9804, lng: 116.0735 },
      Sarawak: { lat: 1.5533, lng: 110.3592 },
      Putrajaya: { lat: 2.9264, lng: 101.6964 },
      Perlis: { lat: 6.4449, lng: 100.2048 },
      Labuan: { lat: 5.2831, lng: 115.2308 },
    };

    const baseCoords = stateCoords[state] || { lat: 3.139, lng: 101.6869 };
    // slight random offset so markers don't overlap exactly
    const calculatedLat = baseCoords.lat + (Math.random() - 0.5) * 0.05;
    const calculatedLng = baseCoords.lng + (Math.random() - 0.5) * 0.05;
    const lat = Number.isFinite(calculatedLat) ? Number(calculatedLat.toFixed(6)) : 3.139;
    const lng = Number.isFinite(calculatedLng) ? Number(calculatedLng.toFixed(6)) : 101.6869;

    const newMarket: Market = {
      id: `user-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      address: address.trim() || `${district}, ${state}`,
      district: district.trim() || state,
      state: state,
      status: 'Active',
      description: `Community-submitted night market. Features local food stalls and fresh produce.`,
      parking: {
        available: hasParking,
        accessible: hasAccessibleParking,
        notes: hasParking ? 'Parking available nearby.' : 'Limited street parking.',
      },
      amenities: {
        toilet: hasToilet,
        prayer_room: hasSurau,
      },
      total_shop: Number(totalShop) || 40,
      location: {
        latitude: lat,
        longitude: lng,
        gmaps_link: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      },
      schedule: [
        {
          days: selectedDays.length > 0 ? selectedDays : ['sat'],
          times: [{ start: startTime, end: endTime, note: 'Evening market' }],
        },
      ],
      shop_list: foods
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      isUserAdded: true,
    };

    saveUserMarket(newMarket);
    onMarketAdded(newMarket);
    setIsSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-suggest-market"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                Suggest a Night Market
              </h3>
              <p className="text-xs text-neutral-400">Add a local Pasar Malam to your community directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">Successfully Saved!</h4>
              <p className="text-xs text-neutral-300 max-w-sm">
                Your suggested night market is now saved and available in your local directory.
              </p>
            </div>
          ) : (
            <>
              {/* Market Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Market Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-suggest-name"
                  type="text"
                  required
                  placeholder="e.g. Pasar Malam Seksyen 7 Shah Alam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    State
                  </label>
                  <select
                    id="select-suggest-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                  >
                    {MALAYSIAN_STATES.filter((s) => s !== 'All States').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    District / Town
                  </label>
                  <input
                    id="input-suggest-district"
                    type="text"
                    placeholder="e.g. Shah Alam / Petaling"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Address
                </label>
                <input
                  id="input-suggest-address"
                  type="text"
                  placeholder="e.g. Jalan Plumbum 7/95, Seksyen 7, 40000 Shah Alam"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Operating Days (Multi-select) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Operating Days <span className="text-rose-400">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_CODES.map((code) => {
                    const isSelected = selectedDays.includes(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        id={`btn-suggest-day-${code}`}
                        onClick={() => toggleDay(code)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          isSelected
                            ? 'bg-emerald-500 text-neutral-950 font-bold'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                        }`}
                      >
                        {DAY_NAMES[code].en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Facilities & Amenities
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 cursor-pointer hover:bg-neutral-850">
                    <input
                      type="checkbox"
                      checked={hasParking}
                      onChange={(e) => setHasParking(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-emerald-500"
                    />
                    <span>Parking Available</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 cursor-pointer hover:bg-neutral-850">
                    <input
                      type="checkbox"
                      checked={hasAccessibleParking}
                      onChange={(e) => setHasAccessibleParking(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-emerald-500"
                    />
                    <span>Accessible Parking</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 cursor-pointer hover:bg-neutral-850">
                    <input
                      type="checkbox"
                      checked={hasSurau}
                      onChange={(e) => setHasSurau(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-emerald-500"
                    />
                    <span>Surau (Prayer Room)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 cursor-pointer hover:bg-neutral-850">
                    <input
                      type="checkbox"
                      checked={hasToilet}
                      onChange={(e) => setHasToilet(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-emerald-500"
                    />
                    <span>Restroom Available</span>
                  </label>
                </div>
              </div>

              {/* Popular Foods */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Popular Street Foods (comma separated)
                </label>
                <input
                  id="input-suggest-food"
                  type="text"
                  value={foods}
                  onChange={(e) => setFoods(e.target.value)}
                  placeholder="Apam Balik, Satay, Roti John, Char Kuey Teow"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Estimated Stalls */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Estimated Stall Count
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={totalShop}
                  onChange={(e) => setTotalShop(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-suggest"
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-emerald-400"
                >
                  {isSubmitting ? 'Saving...' : 'Submit Night Market'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
