import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, RefreshCw, HardDrive, BarChart2, Globe, ArrowRight, Zap,
  File, Power, ChevronDown, Sun, Moon, Monitor, LayoutDashboard,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { cn } from '../utils/helpers';

const FEATURE_ICONS = [RefreshCw, HardDrive, Globe, BarChart2, File, Power];
const FEATURE_COLORS = [
  'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/10',
  'text-violet-600 bg-violet-500/10 dark:text-violet-400 dark:bg-violet-500/10',
  'text-sky-600 bg-sky-500/10 dark:text-sky-400 dark:bg-sky-500/10',
  'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10',
  'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10',
  'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function HeroMockup() {
  const { t } = useTranslation();
  const destinations = t('landing.hero.mockupDestinations', { returnObjects: true }) as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % destinations.length), 2200);
    return () => clearInterval(id);
  }, [destinations.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-[2rem] surface-raised backdrop-blur-xl p-6 shadow-2xl shadow-indigo-500/10"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </div>

        <div className="flex items-center justify-center p-6 bg-white rounded-2xl mb-5 ring-1 ring-slate-900/[0.06]">
          {/* Decorative static QR-like grid — purely visual, not a functional code */}
          <svg viewBox="0 0 100 100" className="w-36 h-36" shapeRendering="crispEdges">
            <rect width="100" height="100" fill="#ffffff" />
            {QR_DOTS.map(([x, y], i) => (
              <rect key={i} x={x * 10} y={y * 10} width="10" height="10" fill="#0f172a" />
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-900/[0.03] dark:bg-white/5 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t('landing.hero.mockupLabel')}
          </span>
          <div className="relative h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="block text-sm font-mono text-indigo-600 dark:text-indigo-400"
              >
                {destinations[index]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl rounded-full" />
    </motion.div>
  );
}

// Fixed, deterministic pseudo-QR pattern for the decorative hero mockup (not a real scannable code).
const QR_DOTS: [number, number][] = (() => {
  const dots: [number, number][] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const isFinderCorner = (x: number, y: number) =>
    (x < 3 && y < 3) || (x > 6 && y < 3) || (x < 3 && y > 6);

  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      if (isFinderCorner(x, y) || rand() > 0.55) dots.push([x, y]);
    }
  }
  return dots;
})();

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const cycle = () => {
    const order = ['light', 'dark', 'system'] as const;
    setTheme(order[(order.indexOf(theme as typeof order[number]) + 1) % order.length]);
  };
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      onClick={cycle}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
    >
      <Icon size={17} />
    </button>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      window.location.href = authService.getGoogleLoginUrl();
    }
  };

  const featureItems = t('landing.features.items', { returnObjects: true }) as { title: string; desc: string }[];
  const steps = t('landing.howItWorks.steps', { returnObjects: true }) as { title: string; desc: string }[];
  const whyItems = t('landing.why.items', { returnObjects: true }) as { title: string; desc: string }[];
  const faqItems = t('landing.faq.items', { returnObjects: true }) as { q: string; a: string }[];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col overflow-x-clip">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <QrCode size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('common.appName')}</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#features" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors">{t('landing.nav.features')}</a>
          <a href="#how-it-works" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors">{t('landing.nav.howItWorks')}</a>
          <a href="#faq" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors">{t('landing.nav.faq')}</a>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher variant="minimal" />
          <ThemeToggle />
          <button
            onClick={handleAction}
            className="ml-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/10 hover:border-slate-900/20
              text-slate-700 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:hover:border-white/20
              dark:text-slate-300 dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard size={15} />
                <span>{t('nav.dashboard')}</span>
              </>
            ) : (
              t('landing.nav.signIn')
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] bg-gradient-to-b from-indigo-500/15 via-violet-500/5 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-8"
            >
              <Zap size={12} />
              {t('landing.hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-7 leading-[0.98] text-balance"
            >
              {t('landing.hero.titleLine1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
                {t('landing.hero.titleLine2')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start gap-4"
            >
              <button
                id="google-signin-btn"
                onClick={handleAction}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold
                  bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100
                  shadow-2xl shadow-indigo-500/20
                  transition-all duration-200 hover:scale-[1.03] active:scale-100 cursor-pointer"
              >
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard size={18} />
                    <span>{t('nav.dashboard')}</span>
                  </>
                ) : (
                  <>
                    <GoogleGlyph />
                    {t('landing.hero.ctaGoogle')}
                  </>
                )}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                {isAuthenticated ? `${t('common.signedInAs') || 'Signed in as'} ${user?.email}` : t('landing.hero.ctaNote')}
              </p>
            </motion.div>
          </div>

          <HeroMockup />
        </div>

        {/* Highlights strip */}
        <Reveal delay={0.1} className="max-w-4xl mx-auto mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {(['free', 'ownDrive', 'noLockIn', 'unlimitedEdits'] as const).map((key) => (
            <div key={key} className="px-3 py-4 rounded-2xl surface">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t(`landing.highlights.${key}`)}</p>
            </div>
          ))}
        </Reveal>
      </header>

      <main className="flex-1">
        {/* Features */}
        <section id="features" className="px-6 py-28 border-t border-slate-200/70 dark:border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-balance">{t('landing.features.title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">{t('landing.features.subtitle')}</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featureItems.map((item, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <Reveal key={item.title} delay={(i % 3) * 0.08}>
                    <div className="h-full p-6 rounded-2xl surface surface-hover transition-colors duration-200">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', FEATURE_COLORS[i])}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 py-28 border-t border-slate-200/70 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.015]">
          <div className="max-w-3xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{t('landing.howItWorks.title')}</h2>
            </Reveal>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.1}>
                  <div className="flex items-start gap-6 p-6 rounded-2xl surface">
                    <span className="font-mono text-sm text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 font-semibold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1.5 text-base">{step.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why Qonnect */}
        <section className="px-6 py-28 border-t border-slate-200/70 dark:border-white/[0.06]">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-14 items-start">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-balance">{t('landing.why.title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">{t('landing.why.subtitle')}</p>
            </Reveal>
            <div className="space-y-6">
              {whyItems.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-28 border-t border-slate-200/70 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.015]">
          <div className="max-w-2xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{t('landing.faq.title')}</h2>
            </Reveal>
            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 0.05}>
                    <div className="surface rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.q}</span>
                        <ChevronDown size={18} className={cn('flex-shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-28 border-t border-slate-200/70 dark:border-white/[0.06]">
          <Reveal className="max-w-4xl mx-auto text-center relative rounded-[2.5rem] px-8 py-20 overflow-hidden bg-slate-900 dark:bg-white/[0.03] border border-slate-900/10 dark:border-white/10">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/30 via-violet-600/10 to-transparent" />
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 text-balance">{t('landing.finalCta.title')}</h2>
            <p className="text-slate-300 dark:text-slate-400 text-lg max-w-xl mx-auto mb-10">{t('landing.finalCta.subtitle')}</p>
            <button
              onClick={handleAction}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold
                bg-white text-slate-900 hover:bg-slate-100
                shadow-2xl shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.03] active:scale-100 cursor-pointer"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard size={18} />
                  <span>{t('nav.dashboard')}</span>
                </>
              ) : (
                <>
                  <GoogleGlyph />
                  {t('landing.finalCta.cta')}
                </>
              )}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <QrCode size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold">{t('common.appName')}</span>
            <span className="text-xs text-slate-400 dark:text-slate-600 ml-2">{t('landing.footer.tagline')}</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-600">
            <a href="#features" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.nav.features')}</a>
            <a href="#how-it-works" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.nav.howItWorks')}</a>
            <a href="#faq" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{t('landing.nav.faq')}</a>
            <span>© {new Date().getFullYear()} {t('common.appName')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
