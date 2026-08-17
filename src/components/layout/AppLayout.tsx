import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, Settings, LogOut, Sun, Moon, Monitor,
  ChevronDown, QrCode, Globe, HardDrive, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/auth';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../utils/helpers';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/create', icon: Plus, label: t('nav.createQr') },
  ];

  const settingsItems = [
    { to: '/settings/domains', icon: Globe, label: t('nav.domains') },
    { to: '/settings/google-drive', icon: HardDrive, label: t('nav.googleDrive') },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    qc.setQueryData(['auth', 'me'], null);
    qc.removeQueries({ queryKey: ['auth'] });
    qc.clear();
    window.location.href = '/';
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const idx = themes.indexOf(theme as typeof themes[number]);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const renderLink = (to: string, Icon: typeof LayoutDashboard, label: string, onClick?: () => void) => {
    const active = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
          active
            ? 'text-indigo-600 dark:text-indigo-300'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5'
        )}
      >
        {active && (
          <motion.div
            layoutId="nav-active-pill"
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="absolute inset-0 rounded-xl bg-indigo-600/10 border border-indigo-500/20 dark:bg-indigo-600/20 dark:border-indigo-500/20"
          />
        )}
        <Icon size={17} className="relative" />
        <span className="relative">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-white/[0.06] p-4 gap-1 fixed inset-y-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-3 py-3 mb-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            <QrCode size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('common.appName')}</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ to, icon, label }) => renderLink(to, icon, label))}

          <div className="mt-2 mb-1 px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            {t('nav.settings')}
          </div>

          {settingsItems.map(({ to, icon, label }) => renderLink(to, icon, label))}
        </nav>

        {/* User area */}
        <div className="relative border-t border-slate-200/80 dark:border-white/[0.06] pt-3">
          <button
            id="user-menu-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all text-left cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || ''} className="w-8 h-8 rounded-full ring-1 ring-slate-200 dark:ring-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-sm font-semibold">
                {user?.name?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name || user?.email}</p>
              {user?.name && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>}
            </div>
            <ChevronDown size={14} className={cn('text-slate-400 dark:text-slate-500 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full left-0 right-0 mb-2 surface-raised rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 dark:border-white/[0.06]">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{t('language.select')}</span>
                  <LanguageSwitcher variant="minimal" />
                </div>
                <button
                  onClick={cycleTheme}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ThemeIcon size={15} />
                  {t('theme.toggle')}: {t(`theme.${theme}`)}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  {t('nav.signOut')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <QrCode size={14} className="text-white" />
          </div>
          <span className="font-bold">{t('common.appName')}</span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher variant="minimal" />
          <button onClick={cycleTheme} className="p-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer">
            <ThemeIcon size={18} />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')} className="p-2 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-white dark:bg-slate-950 pt-16 p-4"
          >
            <nav className="flex flex-col gap-1">
              {[...navItems, ...settingsItems].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                    location.pathname === to
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5'
                  )}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 text-base font-medium cursor-pointer"
              >
                <LogOut size={20} />
                {t('nav.signOut')}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
