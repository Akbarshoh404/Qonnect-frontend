import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldAlert, ExternalLink, Sparkles, Image as ImageIcon, Heart, Info } from 'lucide-react';
import type { InactivePageConfig } from '../../types';
import { Input } from '../ui/Input';
import { cn } from '../../utils/helpers';

interface Branded404StudioProps {
  config: InactivePageConfig;
  onChange: (config: InactivePageConfig) => void;
  className?: string;
}

export function Branded404Studio({ config, onChange, className }: Branded404StudioProps) {
  const { t } = useTranslation();

  const update = (patch: Partial<InactivePageConfig>) => {
    onChange({ ...config, ...patch });
  };

  const title = config.title || 'Link Temporarily Unavailable';
  const message = config.message || 'The owner has temporarily paused this QR code. Please check back soon.';
  const logoUrl = config.logo_url || '';
  const supportUrl = config.support_url || '';
  const supportLabel = config.support_label || 'Contact Support';

  return (
    <div className={cn('grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start', className)}>
      {/* Controls Form Column */}
      <div className="surface rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Branded Inactive & 404 Fallback
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Custom landing page shown to users whenever this QR code is disabled or paused.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Page Headline / Title"
            placeholder="Link Temporarily Unavailable"
            value={config.title || ''}
            onChange={(e) => update({ title: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Explanation Message
            </label>
            <textarea
              rows={3}
              placeholder="We are updating this menu today. Please check back at 6:00 PM!"
              value={config.message || ''}
              onChange={(e) => update({ message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <Input
            label="Brand Logo Image URL (PNG / SVG)"
            placeholder="https://yourbrand.com/logo.png"
            value={config.logo_url || ''}
            onChange={(e) => update({ logo_url: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Support / Action Link URL"
              placeholder="https://yourbrand.com/contact"
              value={config.support_url || ''}
              onChange={(e) => update({ support_url: e.target.value })}
            />

            <Input
              label="Button Text Label"
              placeholder="Contact Support"
              value={config.support_label || ''}
              onChange={(e) => update({ support_label: e.target.value })}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 flex items-start gap-2.5 text-xs text-indigo-700 dark:text-indigo-300">
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <span>
            When active, scans redirect directly to your destination without delay. When paused, this branded page is displayed automatically.
          </span>
        </div>
      </div>

      {/* Live Device Preview Column */}
      <div className="surface rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-between text-center sticky top-24">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Live Inactive Page Preview</span>
        </span>

        {/* Mock Mobile Screen Container */}
        <div className="w-full max-w-[320px] rounded-[32px] p-3 bg-slate-900 text-white shadow-2xl ring-1 ring-white/10 relative overflow-hidden my-auto">
          {/* Dynamic Island / Notch */}
          <div className="w-24 h-4 bg-black rounded-full mx-auto mb-4" />

          {/* Screen Content */}
          <div className="relative py-6 px-4 rounded-2xl bg-[#090c14] border border-white/5 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
            {/* Ambient Radial Glow */}
            <div className="absolute w-44 h-44 rounded-full bg-indigo-500/15 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Logo / Icon */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Preview"
                className="max-h-12 max-w-[140px] object-contain mb-3 rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-lg mb-3 shadow-inner">
                🔗
              </div>
            )}

            {/* Headline */}
            <h4 className="text-sm font-bold text-white mb-1.5 tracking-tight px-2">
              {title}
            </h4>

            {/* Message */}
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4 px-2">
              {message}
            </p>

            {/* Action CTA Button */}
            {supportUrl ? (
              <div className="px-4 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-semibold shadow-md flex items-center gap-1">
                <span>{supportLabel}</span>
                <span>→</span>
              </div>
            ) : null}

            {/* Attribution Footer */}
            <div className="mt-6 pt-3 border-t border-white/5 text-[9px] text-slate-500 flex items-center gap-1">
              <span>Powered by <strong>Qonnect</strong></span>
              <span>·</span>
              <span className="text-indigo-400">Akbarshoh</span>
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-1" />
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Rendered live with server-side response on pause.
        </p>
      </div>
    </div>
  );
}
