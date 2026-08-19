import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Sparkles, Image as ImageIcon, Frame, Sliders,
  Check, RefreshCw, Download, Layers, ShieldCheck
} from 'lucide-react';
import QRCode from 'qrcode';
import type { QRStyleConfig, DotStyle, CornerOuterStyle, CornerInnerStyle } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';

interface QRDesignStudioProps {
  value: string; // The URL to encode
  styleConfig: QRStyleConfig;
  onChange: (newStyle: QRStyleConfig) => void;
  className?: string;
  showDownload?: boolean;
  shortCode?: string;
}

const PRESET_PALETTES = [
  { id: 'obsidian', name: 'Midnight Obsidian', fg: '#0f172a', bg: '#ffffff', gradStart: '#0f172a', gradEnd: '#334155' },
  { id: 'indigo', name: 'Indigo Nebula', fg: '#4f46e5', bg: '#ffffff', gradStart: '#4338ca', gradEnd: '#6366f1' },
  { id: 'violet', name: 'Royal Purple', fg: '#7c3aed', bg: '#ffffff', gradStart: '#6d28d9', gradEnd: '#a855f7' },
  { id: 'emerald', name: 'Emerald Forest', fg: '#059669', bg: '#ffffff', gradStart: '#047857', gradEnd: '#10b981' },
  { id: 'sunset', name: 'Sunset Coral', fg: '#e11d48', bg: '#ffffff', gradStart: '#be123c', gradEnd: '#f97316' },
  { id: 'cyber', name: 'Cyber Blue', fg: '#0284c7', bg: '#ffffff', gradStart: '#0369a1', gradEnd: '#38bdf8' },
  { id: 'gold', name: 'Autumn Amber', fg: '#d97706', bg: '#ffffff', gradStart: '#b45309', gradEnd: '#f59e0b' },
  { id: 'dark-glass', name: 'Dark Mode Glass', fg: '#ffffff', bg: '#090d16', gradStart: '#ffffff', gradEnd: '#cbd5e1' },
];

const PRESET_LOGOS = [
  { id: 'none', label: 'No Logo', icon: '✕' },
  { id: 'instagram', label: 'Instagram', svg: '<svg viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
  { id: 'whatsapp', label: 'WhatsApp', svg: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>' },
  { id: 'telegram', label: 'Telegram', svg: '<svg viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"/></svg>' },
  { id: 'youtube', label: 'YouTube', svg: '<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
  { id: 'wifi', label: 'WiFi Access', svg: '<svg viewBox="0 0 24 24" fill="#6366f1"><path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-6c3.04 0 5.85 1.13 8 3l-1.42 1.42C16.85 14.86 14.54 14 12 14s-4.85.86-6.58 2.42L4 15c2.15-1.87 4.96-3 8-3zm0-6c4.85 0 9.32 1.83 12.73 4.85l-1.42 1.42C20.35 10.68 16.38 9 12 9s-8.35 1.68-11.31 4.27L-.73 11.85C2.68 8.83 7.15 7 12 7zm0-6c6.66 0 12.79 2.53 17.45 6.71l-1.42 1.42C23.85 5.34 18.2 3 12 3S.15 5.34-3.97 9.13L-5.39 7.71C-.73 3.53 5.34 1 12 1z"/></svg>' },
];

const FRAME_PRESETS = [
  { id: 'none', label: 'No Frame' },
  { id: 'bottom', label: 'Bottom Banner', defaultText: 'SCAN ME' },
  { id: 'top', label: 'Top Banner', defaultText: 'VIEW MENU' },
  { id: 'bubble', label: 'Floating Badge', defaultText: 'CONNECT' },
];

export function QRDesignStudio({
  value,
  styleConfig,
  onChange,
  className,
  showDownload = false,
  shortCode = 'qr',
}: QRDesignStudioProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'colors' | 'patterns' | 'logo' | 'frame'>('colors');
  const [qrSvg, setQrSvg] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate the styled SVG QR
  useEffect(() => {
    if (!value) return;

    const fgColor = styleConfig.fg_color || '#0f172a';
    const bgColor = styleConfig.transparent_bg ? '#00000000' : (styleConfig.bg_color || '#ffffff');

    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'H', // Level H allows up to 30% damage/logo occlusion
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((svg) => {
        setQrSvg(svg);
      })
      .catch((err) => console.error(err));
  }, [value, styleConfig.fg_color, styleConfig.bg_color, styleConfig.transparent_bg]);

  const updateConfig = (patch: Partial<QRStyleConfig>) => {
    onChange({ ...styleConfig, ...patch });
  };

  const handleDownload = async (fmt: 'png' | 'svg') => {
    if (fmt === 'svg') {
      const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qonnect-custom-${shortCode}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Draw to hidden canvas and export high-res PNG
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      await QRCode.toCanvas(canvas, value, {
        width: 1200,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: styleConfig.fg_color || '#0f172a',
          light: styleConfig.transparent_bg ? '#00000000' : (styleConfig.bg_color || '#ffffff'),
        },
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qonnect-custom-${shortCode}.png`;
      a.click();
    }
  };

  return (
    <div className={cn('grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start', className)}>
      {/* Controls Column */}
      <div className="surface rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-6">
        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/[0.04] dark:bg-white/[0.04]">
          {[
            { id: 'colors', label: 'Colors & Gradients', icon: Palette },
            { id: 'patterns', label: 'Shapes & Eyes', icon: Sparkles },
            { id: 'logo', label: 'Center Logo', icon: ImageIcon },
            { id: 'frame', label: 'CTA Frame', icon: Frame },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Colors & Gradients */}
        {activeTab === 'colors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Curated Luxury Palettes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_PALETTES.map((p) => {
                  const selected = styleConfig.fg_color === p.fg && styleConfig.bg_color === p.bg;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        updateConfig({
                          fg_color: p.fg,
                          bg_color: p.bg,
                          gradient_start: p.gradStart,
                          gradient_end: p.gradEnd,
                          transparent_bg: false,
                        })
                      }
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer',
                        selected
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      )}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: p.fg }}
                      />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-white/5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleConfig.fg_color || '#0f172a'}
                    onChange={(e) => updateConfig({ fg_color: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/15 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={styleConfig.fg_color || '#0f172a'}
                    onChange={(e) => updateConfig({ fg_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleConfig.bg_color || '#ffffff'}
                    disabled={styleConfig.transparent_bg}
                    onChange={(e) => updateConfig({ bg_color: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/15 cursor-pointer bg-transparent disabled:opacity-30"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styleConfig.transparent_bg || false}
                      onChange={(e) => updateConfig({ transparent_bg: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Transparent</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Shapes & Patterns */}
        {activeTab === 'patterns' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Matrix Dot Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'squares', label: '◼ Squares' },
                  { id: 'rounded', label: '▢ Rounded' },
                  { id: 'dots', label: '⚫ Soft Dots' },
                  { id: 'classy', label: '💎 Diamonds' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateConfig({ dot_style: s.id as DotStyle })}
                    className={cn(
                      'py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-center',
                      (styleConfig.dot_style || 'squares') === s.id
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-white/5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Corner Eye (Outer Ring)
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'square', label: 'Square Ring' },
                    { id: 'rounded', label: 'Rounded Ring' },
                    { id: 'circle', label: 'Circular Ring' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => updateConfig({ corner_outer: o.id as CornerOuterStyle })}
                      className={cn(
                        'w-full text-left py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer',
                        (styleConfig.corner_outer || 'square') === o.id
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-white/10'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Eyeball (Inner Center)
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'square', label: 'Square Dot' },
                    { id: 'dot', label: 'Circular Dot' },
                  ].map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => updateConfig({ corner_inner: i.id as CornerInnerStyle })}
                      className={cn(
                        'w-full text-left py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer',
                        (styleConfig.corner_inner || 'square') === i.id
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-white/10'
                      )}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Logo Embed */}
        {activeTab === 'logo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Center Brand Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_LOGOS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => updateConfig({ logo_preset: l.id as typeof styleConfig.logo_preset })}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer',
                      (styleConfig.logo_preset || 'none') === l.id
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    )}
                  >
                    {l.svg ? (
                      <span
                        className="w-4 h-4 flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: l.svg }}
                      />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center">{l.icon}</span>
                    )}
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/50 dark:border-white/5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Or Custom Logo Image URL (PNG/SVG)
              </label>
              <input
                type="url"
                placeholder="https://yourbrand.com/logo.png"
                value={styleConfig.logo_url || ''}
                onChange={(e) => updateConfig({ logo_url: e.target.value, logo_preset: 'none' })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Level-H error correction ensures QR remains 100% scannable.</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab 4: CTA Callout Frame */}
        {activeTab === 'frame' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Call-to-Action Frame Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FRAME_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      updateConfig({
                        frame_style: f.id as typeof styleConfig.frame_style,
                        frame_text: styleConfig.frame_text || f.defaultText,
                      })
                    }
                    className={cn(
                      'py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-center',
                      (styleConfig.frame_style || 'none') === f.id
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {styleConfig.frame_style && styleConfig.frame_style !== 'none' && (
              <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Frame Callout Text
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="SCAN ME"
                    value={styleConfig.frame_text || ''}
                    onChange={(e) => updateConfig({ frame_text: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 uppercase tracking-wider font-bold"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Live Preview Card */}
      <div className="surface rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-between text-center sticky top-24">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Live Vector Preview
        </span>

        {/* QR Code Container with Frame support */}
        <div className="relative flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-none ring-1 ring-slate-900/10 dark:ring-white/10 my-auto">
          {/* Top Frame Banner */}
          {styleConfig.frame_style === 'top' && (
            <div className="mb-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold tracking-widest uppercase shadow-sm">
              {styleConfig.frame_text || 'SCAN ME'}
            </div>
          )}

          {/* Floating Bubble Frame */}
          {styleConfig.frame_style === 'bubble' && (
            <div className="mb-2 px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold tracking-wider uppercase shadow-md animate-bounce">
              ⚡ {styleConfig.frame_text || 'SCAN HERE'}
            </div>
          )}

          {/* SVG QR Code */}
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          {/* Center Logo Overlay */}
          {styleConfig.logo_preset && styleConfig.logo_preset !== 'none' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center ring-2 ring-white">
              {PRESET_LOGOS.find((p) => p.id === styleConfig.logo_preset)?.svg ? (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: PRESET_LOGOS.find((p) => p.id === styleConfig.logo_preset)?.svg || '',
                  }}
                />
              ) : null}
            </div>
          )}

          {styleConfig.logo_url && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white p-1 shadow-md flex items-center justify-center ring-2 ring-white overflow-hidden">
              <img src={styleConfig.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Bottom Frame Banner */}
          {styleConfig.frame_style === 'bottom' && (
            <div className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold tracking-widest uppercase shadow-sm">
              {styleConfig.frame_text || 'SCAN ME'}
            </div>
          )}
        </div>

        {/* Action Buttons (Download PNG/SVG) */}
        {showDownload && (
          <div className="flex items-center gap-2 w-full mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('png')}
              className="flex-1"
              leftIcon={<Download size={14} />}
            >
              Export PNG
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDownload('svg')}
              className="flex-1"
              leftIcon={<Download size={14} />}
            >
              Export Vector SVG
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
