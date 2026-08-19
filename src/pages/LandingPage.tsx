import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  QrCode, RefreshCw, HardDrive, BarChart2, Globe, ArrowRight, Zap,
  File, Power, ChevronDown, Sun, Moon, Monitor, LayoutDashboard,
  CheckCircle2, Sparkles, Shield, Smartphone, FileText,
  ExternalLink, Layers, ArrowUpRight
} from 'lucide-react';
import QRCode from 'qrcode';
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

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// Scenarios for the interactive dynamic simulator
const DEMO_SCENARIOS = [
  {
    id: 'menu',
    name: 'Restaurant Menu',
    icon: '🍷',
    initial: 'spring-menu-2026.pdf',
    updated: 'summer-tasting-v2.pdf',
    type: 'Google Drive PDF',
    accent: 'indigo',
    scans: '1,420',
  },
  {
    id: 'vcard',
    name: 'Executive vCard',
    icon: '💼',
    initial: 'contact-card-v1.vcf',
    updated: 'linkedin.com/in/alex-dev',
    type: 'Contact Card',
    accent: 'violet',
    scans: '840',
  },
  {
    id: 'promo',
    name: 'Product Drop',
    icon: '🛍️',
    initial: 'spring-collection.pdf',
    updated: 'autumn-lookbook.pdf',
    type: 'Google Drive File',
    accent: 'sky',
    scans: '3,890',
  },
  {
    id: 'campaign',
    name: 'Live Event',
    icon: '🎟️',
    initial: 'conference-agenda.pdf',
    updated: 'livestream-room-4b.com',
    type: 'Redirect Link',
    accent: 'emerald',
    scans: '5,210',
  },
];

function InteractiveQRMockup() {
  const { t } = useTranslation();
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [isUpdated, setIsUpdated] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);

  // 3D Parallax Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Generate a clean vector QR code for the constant short link
  useEffect(() => {
    const demoUrl = 'https://qonnect.akbarshoh-dev.uz/q/demo-menu';
    QRCode.toString(demoUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff00',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error(err));
  }, []);

  const scenario = DEMO_SCENARIOS[selectedScenario];
  const currentDestination = isUpdated ? scenario.updated : scenario.initial;

  const triggerUpdateSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsUpdated((prev) => !prev);
      setIsSimulating(false);
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-md perspective-1000"
    >
      {/* 3D Tilting Device Mockup */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-[2.5rem] glass-panel p-6 sm:p-7 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5 transition-shadow duration-300"
      >
        {/* Top Window Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2">
              qonnect.cloud / live-qr
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active · Instant Sync
          </div>
        </div>

        {/* Scenario Pills Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] mb-5">
          {DEMO_SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(i);
                setIsUpdated(false);
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer',
                selectedScenario === i
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <span>{sc.icon}</span>
              <span className="truncate">{sc.name}</span>
            </button>
          ))}
        </div>

        {/* QR Code Container with subtle radar scan effect */}
        <div className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl mb-5 ring-1 ring-slate-900/[0.06] dark:ring-white/[0.08] overflow-hidden">
          {/* Animated radar scan line when simulating */}
          {isSimulating && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.45, repeat: 1, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-20 shadow-lg shadow-indigo-500"
            />
          )}

          <div
            className="w-40 h-40 flex items-center justify-center dark:invert transition-all"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <QrCode size={13} />
            <span>Printed code never changes</span>
          </div>
        </div>

        {/* Live Dynamic Destination Card */}
        <div className="rounded-2xl bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/5 dark:border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>{t('landing.hero.mockupLabel')}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-normal normal-case">
              {scenario.type}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FileText size={16} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDestination}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="truncate"
                >
                  <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 truncate">
                    {currentDestination}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {isUpdated ? '✨ Updated live in cloud' : 'Original file'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={triggerUpdateSimulation}
              disabled={isSimulating}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <RefreshCw
                size={12}
                className={cn('transition-transform', isSimulating && 'animate-spin')}
              />
              <span>{isUpdated ? 'Reset' : 'Swap File'}</span>
            </motion.button>
          </div>
        </div>

        {/* Live sync reassurance footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>0 reprints required</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {scenario.scans} scans recorded
          </span>
        </div>
      </motion.div>

      {/* Luxury Ambient Glows behind the card */}
      <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-48 h-48 -z-10 bg-sky-500/15 blur-2xl rounded-full pointer-events-none" />
    </motion.div>
  );
}

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
      title="Toggle theme"
    >
      <Icon size={16} />
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

  const featureItems = t('landing.features.items', { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];
  const steps = t('landing.howItWorks.steps', { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];
  const whyItems = t('landing.why.items', { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];
  const faqItems = t('landing.faq.items', { returnObjects: true }) as {
    q: string;
    a: string;
  }[];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 dark:bg-[#06080e] dark:text-slate-100 flex flex-col overflow-x-clip selection:bg-indigo-500/20">
      {/* Floating Apple-Style Capsule Navigation */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <nav className="flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-full glass-panel shadow-lg shadow-black/[0.02] dark:shadow-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              {t('common.appName')}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              {t('landing.nav.features')}
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              {t('landing.nav.howItWorks')}
            </a>
            <a
              href="#why"
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              Why Qonnect
            </a>
            <a
              href="#faq"
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/5 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              {t('landing.nav.faq')}
            </a>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="minimal" />
            <ThemeToggle />
            <button
              onClick={handleAction}
              className="ml-1 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold
                bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100
                shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard size={13} />
                  <span>{t('nav.dashboard')}</span>
                </>
              ) : (
                <>
                  <span>{t('landing.nav.signIn')}</span>
                  <ArrowUpRight size={13} />
                </>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Soft Ambient Mesh Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[70rem] h-[45rem] bg-gradient-to-b from-indigo-500/12 via-violet-500/5 to-transparent blur-3xl rounded-full" />
          <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-sky-500/8 blur-3xl rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-sm"
            >
              <Sparkles size={13} className="text-indigo-500 animate-pulse" />
              <span>{t('landing.hero.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-[4.75rem] font-bold tracking-tight mb-6 leading-[1.02] text-balance"
            >
              {t('landing.hero.titleLine1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
                {t('landing.hero.titleLine2')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed text-balance"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start gap-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  id="google-signin-btn"
                  onClick={handleAction}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold
                    bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100
                    shadow-xl shadow-indigo-500/15 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {isAuthenticated ? (
                    <>
                      <LayoutDashboard size={18} />
                      <span>{t('nav.dashboard')}</span>
                    </>
                  ) : (
                    <>
                      <GoogleGlyph />
                      <span>{t('landing.hero.ctaGoogle')}</span>
                    </>
                  )}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield size={14} className="text-emerald-500 flex-shrink-0" />
                <span>
                  {isAuthenticated
                    ? `${t('common.signedInAs') || 'Signed in as'} ${user?.email}`
                    : t('landing.hero.ctaNote')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Dynamic QR Mockup */}
          <InteractiveQRMockup />
        </div>

        {/* Highlights Bar */}
        <Reveal delay={0.15} className="max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['free', 'ownDrive', 'noLockIn', 'unlimitedEdits'] as const).map((key) => (
              <div
                key={key}
                className="px-4 py-3.5 rounded-2xl glass-panel text-center transition-all hover:scale-[1.02]"
              >
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t(`landing.highlights.${key}`)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <main className="flex-1">
        {/* Apple-Style Bento Grid Features */}
        <section
          id="features"
          className="px-6 py-24 border-t border-slate-200/60 dark:border-white/[0.06]"
        >
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
                {t('landing.features.title')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg text-balance">
                {t('landing.features.subtitle')}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featureItems.map((item, i) => {
                const Icon = FEATURE_ICONS[i] || Zap;
                return (
                  <Reveal key={item.title} delay={(i % 3) * 0.08}>
                    <div className="h-full p-7 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between group">
                      <div>
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105 duration-300',
                            FEATURE_COLORS[i]
                          )}
                        >
                          <Icon size={22} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-white/[0.04] flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        <span>Learn more</span>
                        <ArrowUpRight size={14} className="ml-1 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* The Dynamic Difference (Static vs Dynamic) */}
        <section
          id="why"
          className="px-6 py-24 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.015]"
        >
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                The Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
                {t('landing.why.title')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
                {t('landing.why.subtitle')}
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Old Static QR */}
              <Reveal delay={0.05}>
                <div className="h-full p-8 rounded-3xl surface border-rose-500/20 dark:border-rose-500/20 bg-rose-500/[0.02]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6">
                    <span>Traditional Static QR</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Hardcoded & Fragile
                  </h3>
                  <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span>Target URL is burned into the matrix permanently</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span>Broken link or typo requires 100% reprinting</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-rose-500 font-bold mt-0.5">✕</span>
                      <span>Zero scan analytics or device metrics</span>
                    </li>
                  </ul>
                </div>
              </Reveal>

              {/* Qonnect Dynamic QR */}
              <Reveal delay={0.1}>
                <div className="h-full p-8 rounded-3xl glass-panel border-indigo-500/30 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.04] to-transparent relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6">
                    <Sparkles size={12} />
                    <span>Qonnect Dynamic QR</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Infinite Cloud Flexibility
                  </h3>
                  <ul className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Swap PDF menu or target link in 2 clicks</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Files live safely inside your own Google Drive</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Detailed scan analytics by city, device & OS</span>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3-Step Walkthrough */}
        <section
          id="how-it-works"
          className="px-6 py-24 border-t border-slate-200/60 dark:border-white/[0.06]"
        >
          <div className="max-w-4xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                {t('landing.howItWorks.title')}
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.1}>
                  <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 w-9 h-9 flex items-center justify-center rounded-xl font-bold mb-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section
          id="faq"
          className="px-6 py-24 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.015]"
        >
          <div className="max-w-2xl mx-auto">
            <Reveal className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                {t('landing.faq.title')}
              </h2>
            </Reveal>

            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 0.04}>
                    <div className="glass-panel rounded-2xl overflow-hidden transition-all">
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-4.5 text-left cursor-pointer hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]"
                      >
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={cn(
                            'flex-shrink-0 text-slate-400 transition-transform duration-200',
                            open && 'rotate-180 text-indigo-600 dark:text-indigo-400'
                          )}
                        />
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
                            <p className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-white/[0.04] pt-3">
                              {item.a}
                            </p>
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

        {/* Final CTA Banner */}
        <section className="px-6 py-24 border-t border-slate-200/60 dark:border-white/[0.06]">
          <Reveal className="max-w-4xl mx-auto text-center relative rounded-[3rem] px-8 py-16 sm:py-20 overflow-hidden bg-slate-900 dark:bg-white/[0.03] border border-slate-900/10 dark:border-white/10 shadow-2xl">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/30 via-violet-600/15 to-transparent pointer-events-none" />
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 text-balance">
              {t('landing.finalCta.title')}
            </h2>
            <p className="text-slate-300 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-9 text-balance">
              {t('landing.finalCta.subtitle')}
            </p>
            <button
              onClick={handleAction}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold
                bg-white text-slate-900 hover:bg-slate-100
                shadow-2xl shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard size={18} />
                  <span>{t('nav.dashboard')}</span>
                </>
              ) : (
                <>
                  <GoogleGlyph />
                  <span>{t('landing.finalCta.cta')}</span>
                </>
              )}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <QrCode size={14} className="text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">
                {t('common.appName')}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
                {t('landing.footer.tagline')}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="#features"
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {t('landing.nav.features')}
              </a>
              <a
                href="#how-it-works"
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {t('landing.nav.howItWorks')}
              </a>
              <a
                href="#faq"
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {t('landing.nav.faq')}
              </a>
              <span>© {new Date().getFullYear()} Qonnect</span>
            </div>
          </div>

          {/* Akbarshoh Portfolio Signature Banner */}
          <div className="pt-6 border-t border-slate-200/40 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational · Cloudflare & Google Drive Ready</span>
            </div>

            <a
              href="https://akbarshoh-dev.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/10 shadow-sm transition-all cursor-pointer"
            >
              <span>Crafted with</span>
              <span className="text-rose-500">❤️</span>
              <span>by</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                Akbarshoh
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                (akbarshoh-dev.uz)
              </span>
              <ArrowUpRight size={13} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
