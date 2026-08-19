import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, LogOut, Sun, Moon, Monitor,
  ChevronDown, QrCode, Globe, HardDrive, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/auth';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../utils/helpers';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { pageEnterMotion, popoverMotion, premiumEase, usePremiumMotion, quickTransition, standardTransition } from '../../utils/motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { reduceMotion } = usePremiumMotion();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/create', icon: Plus, label: t('nav.createQr') },
  ];

  const settingsItems = [
    { to: '/settings/domains', icon: Globe, label: t('nav.domains') },
    { to: '/settings/google-drive', icon: HardDrive, label: t('nav.googleDrive') },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

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
          'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
          active
            ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-white/[0.06] bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4 gap-1 fixed inset-y-0 z-30">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-3 mb-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            <QrCode size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('common.appName')}</span>
        </Link>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ to, icon, label }) => renderLink(to, icon, label))}

          <div className="mt-4 mb-1.5 px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t('nav.settings')}
          </div>

          {settingsItems.map(({ to, icon, label }) => renderLink(to, icon, label))}
        </nav>

        {/* User profile popover trigger */}
        <div className="relative border-t border-slate-200/80 dark:border-white/[0.06] pt-3">
          <button
            id="user-menu-trigger"
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-controls="user-menu-panel"
            className="flex items-center gap-3 w-full p-2.5 rounded-2xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all text-left cursor-pointer border border-transparent hover:border-slate-200/60 dark:hover:border-white/10"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || ''} className="w-8 h-8 rounded-full ring-1 ring-slate-200 dark:ring-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-sm font-semibold">
                {user?.name?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || user?.email}</p>
              {user?.name && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>}
            </div>
            <ChevronDown size={14} className={cn('text-slate-400 dark:text-slate-500 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                id="user-menu-panel"
                initial={popoverMotion.initial}
                animate={popoverMotion.animate}
                exit={popoverMotion.exit}
                transition={quickTransition}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-xl p-1.5 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-white/5"
              >
                {/* Language selection pills */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('language.select')}</span>
                  <LanguageSwitcher variant="pills" />
                </div>

                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={cycleTheme}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ThemeIcon size={14} />
                    <span>{t('theme.toggle')}</span>
                  </div>
                  <span className="font-semibold text-slate-400 dark:text-slate-500 capitalize">{theme}</span>
                </button>

                {/* Sign out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t('nav.signOut')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile Top Navbar (iPhone 12/14/15/16 Pro optimized) */}
      <div className="lg:hidden sticky top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-white/85 dark:bg-[#07090e]/85 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <QrCode size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">{t('common.appName')}</span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSwitcher variant="minimal" />
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-300 cursor-pointer"
            aria-label={t('theme.toggle')}
          >
            <ThemeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('nav.menu')}
            aria-expanded={mobileOpen}
            className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-nav-panel"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: premiumEase }}
              className="lg:hidden fixed inset-x-0 top-14 z-30 bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl p-4 border-b border-slate-200/80 dark:border-white/[0.08] shadow-2xl space-y-3"
            >
              <nav className="flex flex-col gap-1">
                {[...navItems, ...settingsItems].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                      location.pathname === to
                        ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5'
                    )}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                  ) : null}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {user?.name || user?.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  <span>{t('nav.signOut')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <main className="flex-1 lg:ml-64 min-w-0 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 w-full">
          <motion.div
            key={location.pathname}
            initial={pageEnterMotion.initial}
            animate={pageEnterMotion.animate}
            transition={standardTransition}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
