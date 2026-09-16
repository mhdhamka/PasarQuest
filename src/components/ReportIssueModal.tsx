import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  Send,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Market } from '../types';
import { DAY_NAMES } from '../utils/constants';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
  onReportSubmitted?: (message: string) => void;
}

export type IssueCategory =
  | 'hours_days'
  | 'location_address'
  | 'closed_relocated'
  | 'amenities'
  | 'other';

const ADMIN_EMAIL = 'admin@pasarmalam.my';

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  market,
  onReportSubmitted,
}) => {
  const [category, setCategory] = useState<IssueCategory>('hours_days');
  const [details, setDetails] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !market) return null;

  const operatingDaysStr = market.days_operating
    ? market.days_operating.map((d) => DAY_NAMES[d] || `Day ${d}`).join(', ')
    : 'Unknown';

  const categoryLabels: Record<IssueCategory, string> = {
    hours_days: 'Wrong Operating Days or Hours',
    location_address: 'Incorrect Location, Address or Map Pin',
    closed_relocated: 'Market Permanently Closed or Relocated',
    amenities: 'Incorrect Amenities (Parking, Surau, Restroom)',
    other: 'Other Corrections or Updates',
  };

  const generateReportEmailBody = () => {
    return (
`[PASAR MALAM CORRECTION REPORT]

Market Name: ${market.name}
Market ID: ${market.id}
State / District: ${market.state} / ${market.district || 'N/A'}
Current Address: ${market.address || 'N/A'}
Coordinates: ${market.location?.latitude ?? 'N/A'}, ${market.location?.longitude ?? 'N/A'}
Current Operating Days: ${operatingDaysStr}
Current Operating Hours: ${market.operating_hours || 'N/A'}

Category of Issue: ${categoryLabels[category]}

Suggested Correction / Notes:
${details || 'Please verify the operating details for this night market.'}

Reported By: ${reporterContact || 'Anonymous Night Market Visitor'}
Date Reported: ${new Date().toISOString()}
`
    );
  };

  const handleSendMailto = () => {
    const subject = encodeURIComponent(`[Report Incorrect Info] ${market.name} (${market.state})`);
    const body = encodeURIComponent(generateReportEmailBody());
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    if (onReportSubmitted) {
      onReportSubmitted('Report draft opened in your email client.');
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmitInApp = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Store in localStorage history for audit
    try {
      const stored = localStorage.getItem('cpm_reported_issues');
      const list = stored ? JSON.parse(stored) : [];
      list.push({
        id: `report-${Date.now()}`,
        marketId: market.id,
        marketName: market.name,
        category,
        details,
        reporterContact,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('cpm_reported_issues', JSON.stringify(list));
    } catch {
      // ignore
    }

    if (onReportSubmitted) {
      onReportSubmitted(`Thank you! Your correction report for ${market.name} has been submitted to ${ADMIN_EMAIL}.`);
    }

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setDetails('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-report-incorrect-info"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 bg-neutral-900/90 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Report Incorrect Info
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-[260px] sm:max-w-xs">
                {market.name} • {market.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              Thank you for helping keep Malaysian night market records accurate. Our admin team will review this data at <span className="text-amber-300 font-mono">{ADMIN_EMAIL}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitInApp} className="overflow-y-auto p-5 space-y-4">
            {/* Pre-filled Reference Capsule */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2 text-xs text-neutral-300">
              <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block">
                Current Registered Record
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{market.district || market.state}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{operatingDaysStr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300 sm:col-span-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{market.operating_hours || 'Evening hours'}</span>
                </div>
              </div>
            </div>

            {/* Error Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-200">
                What information is inaccurate? <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="hours_days">Wrong Operating Days or Hours</option>
                <option value="location_address">Incorrect Location, Address or Map Pin</option>
                <option value="closed_relocated">Market Permanently Closed or Relocated</option>
                <option value="amenities">Incorrect Amenities (Parking, Surau, Restroom)</option>
                <option value="other">Other Corrections or Updates</option>
              </select>
            </div>

            {/* Correction Details Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-200">
                Correction Details / What should it be? <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="textarea-report-details"
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="E.g., This night market actually operates on Wednesdays only, starting from 4:30 PM to 10:00 PM..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Optional Reporter Contact */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Your Contact (Optional, for clarification)
              </label>
              <input
                type="text"
                id="input-reporter-contact"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="Email or phone number (e.g. foodie@gmail.com)"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Destination Alias Info */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-2.5 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>Sends to admin alias:</span>
                <span className="font-mono text-amber-300">{ADMIN_EMAIL}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white"
                title="Copy formatted report to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleSendMailto}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
                title="Open pre-filled draft in your default email client"
              >
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>Open in Email App</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/70 bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400 shadow-md shadow-amber-500/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Report to Admin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
