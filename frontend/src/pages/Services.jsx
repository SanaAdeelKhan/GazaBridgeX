// frontend/src/pages/Services.jsx
// Retheme: navy/gold/olive design system (colors.js) — matches Home.jsx / HowItWorks.jsx
// Deps: framer-motion (already installed)
// Fonts: Instrument Serif + DM Sans (in index.html)

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import colors from '../theme/colors';

function NoiseOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-srv">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-srv)" />
    </svg>
  );
}

function Magnetic({ children, strength = 0.45 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }, [strength, x, y]);

  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.div>
  );
}

function CursorBlob() {
  const blobRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => { target.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    let frame;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div
      ref={blobRef}
      className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    >
      <div className="w-full h-full rounded-full blur-[80px]" style={{ backgroundColor: colors.goldGlow }} />
    </div>
  );
}

const ALL = 'All';
const CATEGORIES = [ALL, 'Development', 'Design', 'Marketing', 'Data', 'Security', 'Career'];

const catAccent = {
  Development: {
    pillBg: colors.primaryLight, pillText: colors.primary,
    dot: colors.primary,
    barFrom: colors.primary, barTo: colors.primaryHover,
  },
  Design: {
    pillBg: colors.oliveLight, pillText: colors.oliveHover,
    dot: colors.olive,
    barFrom: colors.olive, barTo: colors.oliveHover,
  },
  Marketing: {
    pillBg: colors.goldLight, pillText: colors.goldHover,
    dot: colors.gold,
    barFrom: colors.gold, barTo: colors.goldHover,
  },
  Data: {
    pillBg: 'rgba(46,134,193,0.12)', pillText: colors.secondary,
    dot: colors.secondary,
    barFrom: colors.secondary, barTo: colors.primary,
  },
  Security: {
    pillBg: colors.errorBg, pillText: colors.error,
    dot: colors.error,
    barFrom: colors.error, barTo: '#922B21',
  },
  Career: {
    pillBg: colors.successBg, pillText: colors.success,
    dot: colors.success,
    barFrom: colors.success, barTo: colors.oliveHover,
  },
};

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ran) {
        setRan(true);
        const dur = 2000;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 4)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, ran]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Services() {
  const [activeTab, setActiveTab] = useState(ALL);
  const heroRef  = useRef(null);
  const filterRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const filtered = useMemo(
    () => activeTab === ALL ? services : services.filter((s) => s.category === activeTab),
    [activeTab],
  );

  return (
    <div style={{ backgroundColor: colors.primaryLight, fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, backgroundColor: colors.primaryLight }}
        className="relative min-h-screen flex items-center overflow-hidden pt-24"
      >
        <NoiseOverlay />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${colors.primaryGlow} 1px, transparent 1px), linear-gradient(90deg, ${colors.primaryGlow} 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        <MouseGradient />

        <motion.div
          style={{ y: heroY, borderColor: 'rgba(26,82,118,0.35)' }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border pointer-events-none"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]), borderColor: 'rgba(26,82,118,0.2)' }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border pointer-events-none"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]), backgroundColor: 'rgba(252,243,207,0.8)' }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute top-36 right-24 hidden xl:block"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 112 112">
              <path id="srv-ring" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill={colors.gold} fontWeight="500" letterSpacing="3">
                <textPath href="#srv-ring">22 SKILLS • ALL FREE • 22 SKILLS • ALL FREE • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: colors.gold, boxShadow: '0 10px 25px rgba(212,160,23,0.4)' }}>
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-16 right-16 hidden xl:block"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-4 w-52"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: colors.goldGlow }}>🎓</div>
              <div>
                <div className="text-xs font-medium" style={{ color: colors.muted }}>This month</div>
                <div className="text-sm font-semibold" style={{ color: colors.body }}>420+ enrolled</div>
              </div>
            </div>
            <div className="flex gap-1">
              {[70, 85, 60, 95, 75, 90, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 2.4 + i * 0.07, duration: 0.4 }}
                  style={{ height: `${h * 0.28}px`, originY: 1, background: `linear-gradient(to top, ${colors.gold}, ${colors.primary})` }}
                  className="flex-1 rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-6 w-full"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border"
                style={{ borderColor: 'rgba(26,82,118,0.2)' }}
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative flex h-2.5 w-2.5"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: colors.gold }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: colors.gold }} />
                </motion.span>
                <span className="text-sm font-semibold" style={{ color: colors.title }}>22 Free Skill Tracks</span>
              </motion.div>

              <div className="space-y-1 overflow-hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem, 6.5vw, 6rem)', fontWeight: 700, color: colors.headingDark }}
                >
                  Skills That
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight italic"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem, 6.5vw, 6rem)', fontWeight: 700, color: colors.gold }}
                >
                  Open Doors
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.54, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem, 6.5vw, 6rem)', fontWeight: 700, color: colors.headingDark }}
                >
                  For Free
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8 }}
                className="text-lg leading-relaxed max-w-lg"
                style={{ color: colors.muted }}
              >
                22 comprehensive digital training paths built for people in Gaza —
                from complete beginner to market-ready professional, at zero cost.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Magnetic>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(212,160,23,0.35)' }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-8 py-4 text-white font-bold rounded-full shadow-xl overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-sm">
                        Start Learning Free
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                      </span>
                    </motion.button>
                  </Link>
                </Magnetic>

                <Magnetic strength={0.3}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => filterRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 border-2 border-gray-300 font-bold rounded-full transition-all duration-300 text-sm hover:border-[#D4A017] hover:text-[#D4A017]"
                    style={{ color: colors.body }}
                  >
                    Browse All Skills ↓
                  </motion.button>
                </Magnetic>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex flex-wrap gap-6 pt-2"
              >
                {[
                  { v: 22, suffix: '+', l: 'Skill tracks' },
                  { v: 850, suffix: '+', l: 'Expert mentors' },
                  { v: 45, suffix: '', l: 'Countries' },
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: colors.headingDark }}>
                      <AnimatedNumber value={s.v} suffix={s.suffix} />
                    </span>
                    <span className="text-sm" style={{ color: colors.muted }}>{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center h-[540px]"
            >
              <motion.div
                animate={{ rotate: [-5, -3, -5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-72 h-[420px] rounded-3xl border"
                style={{ backgroundColor: 'rgba(46,134,193,0.10)', borderColor: 'rgba(46,134,193,0.25)' }}
              />
              <motion.div
                animate={{ rotate: [3, 5, 3] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute w-72 h-[420px] rounded-3xl border"
                style={{ backgroundColor: 'rgba(252,243,207,0.6)', borderColor: 'rgba(26,82,118,0.2)' }}
              />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-7 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}>
                    <span className="text-white text-lg">📚</span>
                  </div>
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase" style={{ backgroundColor: colors.goldLight, color: colors.goldHover }}>
                    22 Tracks
                  </span>
                </div>

                <div className="space-y-2">
                  {CATEGORIES.slice(1).map((cat, i) => {
                    const a = catAccent[cat];
                    const count = services.filter(s => s.category === cat).length;
                    return (
                      <motion.div
                        key={cat}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="flex items-center justify-between bg-gray-50/80 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.dot }} />
                          <span className="text-xs font-semibold" style={{ color: colors.body }}>{cat}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: a.pillBg, color: a.pillText }}>
                          {count} tracks
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs mt-1" style={{ backgroundColor: colors.goldLight, color: colors.muted }}>
                  <span style={{ color: colors.gold }}>✦</span>
                  <span>All tracks <strong style={{ color: colors.goldHover }}>100% free</strong></span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-4 right-0 bg-white shadow-xl shadow-black/8 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20"
              >
                <span className="text-base">🌍</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: colors.body }}>45 Countries</div>
                  <div className="text-[10px]" style={{ color: colors.muted }}>Mentors active</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-6 left-0 bg-white shadow-xl shadow-black/8 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20"
              >
                <span className="text-base">🏆</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: colors.body }}>3,200+ Graduates</div>
                  <div className="text-[10px]" style={{ color: colors.muted }}>hired globally</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: colors.muted }}>scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full" style={{ backgroundColor: colors.muted }} />
          </motion.div>
        </motion.div>
      </motion.section>

      <div className="relative py-4 overflow-hidden border-y" style={{ backgroundColor: colors.sidebar, borderColor: colors.onDarkBorder }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {[...CATEGORIES.slice(1), ...CATEGORIES.slice(1)].map((cat, i) => {
            const icon = {
              Development: '💻', Design: '🎨', Marketing: '📣',
              Data: '📊', Security: '🔐', Career: '🚀',
            }[cat];
            const doubled = [icon, cat, icon, cat];
            return doubled.map((item, j) => (
              <span
                key={`${i}-${j}`}
                className="text-sm font-medium tracking-wide"
                style={{ color: j % 2 === 0 ? colors.gold : colors.onDarkMuted }}
              >
                {item}
              </span>
            ));
          })}
        </motion.div>
      </div>

      <div
        ref={filterRef}
        className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide">

            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat;
              const accent = cat !== ALL ? catAccent[cat] : null;
              const count = cat === ALL ? services.length : services.filter(s => s.category === cat).length;

              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  className="relative whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 border border-transparent"
                  style={isActive ? { backgroundColor: colors.sidebar, color: colors.white } : { color: colors.muted }}
                >
                  {accent && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent.dot, opacity: isActive ? 0.6 : 1 }} />
                  )}
                  {cat}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={isActive ? { backgroundColor: 'rgba(255,255,255,0.2)', color: colors.white } : { backgroundColor: colors.badgeNeutral, color: colors.muted }}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}

            <div className="ml-auto pl-4 flex-shrink-0 border-l border-gray-100 flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeTab}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] whitespace-nowrap"
                  style={{ color: colors.muted }}
                >
                  <span className="font-semibold" style={{ color: colors.body }}>{filtered.length}</span> tracks
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-label'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="h-px w-8" style={{ backgroundColor: colors.gold }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: colors.gold }}>
                {activeTab === ALL ? 'All Programmes' : activeTab}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs" style={{ color: colors.muted }}>{filtered.length} available</span>
            </motion.div>
          </AnimatePresence>

          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((service, index) => {
                const accent = catAccent[service.category] || catAccent['Career'];
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.38, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative rounded-3xl border border-gray-100 bg-white overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at top left,rgba(26,82,118,0.05) 0%,transparent 65%)' }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-full h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ background: `linear-gradient(90deg, ${accent.barFrom}, ${accent.barTo})` }}
                    />

                    <div className="p-7 flex flex-col min-h-[270px]">
                      <div className="flex items-start justify-between mb-5">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.12 }}
                          transition={{ duration: 0.25 }}
                          className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-white flex items-center justify-center text-2xl border border-gray-100 group-hover:border-gray-200 shadow-sm transition-all"
                        >
                          {service.icon}
                        </motion.div>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full tracking-wide" style={{ backgroundColor: accent.pillBg, color: accent.pillText }}>
                          {service.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 transition-colors duration-200 hover:text-[#D4A017]" style={{ color: colors.body }}>
                        {service.title}
                      </h3>

                      <p className="text-sm leading-relaxed flex-1" style={{ color: colors.muted }}>
                        {service.description}
                      </p>

                      <motion.p
                        initial={false}
                        className="text-xs leading-relaxed overflow-hidden"
                        style={{ maxHeight: 0, color: colors.muted }}
                        whileHover={{ maxHeight: 40 }}
                        transition={{ duration: 0.3 }}
                      >
                        {service.details}
                      </motion.p>

                      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: accent.pillBg, color: accent.pillText }}>
                          {service.stats}
                        </span>
                        <motion.span
                          whileHover={{ x: 3 }}
                          className="text-xs font-semibold transition-colors flex items-center gap-1 hover:text-[#D4A017]"
                          style={{ color: colors.muted }}
                        >
                          Enroll Free
                          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>→</motion.span>
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.sidebar} 0%, ${colors.primary} 55%, ${colors.secondary} 100%)` }} />

        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
          />
        </div>
        <NoiseOverlay />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
                Start Today — Zero Cost
              </span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Not sure where<br />
              <span className="relative">
                to start?
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full h-5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <path d="M0 12 Q 60 0 120 10 Q 180 20 240 10 Q 300 0 360 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
                </motion.svg>
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Take our free 2-minute skill assessment and get a personalised learning
              path built for your exact goals and experience level.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 pt-2"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white font-bold rounded-full shadow-2xl text-base transition-all duration-300 flex items-center gap-2 hover:bg-[#FCF3CF]"
                    style={{ color: colors.title }}
                  >
                    Get Started Free
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 border-2 border-white/40 text-white font-bold rounded-full text-base transition-all duration-300"
                  >
                    Become a Volunteer
                  </motion.button>
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-6 pt-4 text-white/70"
            >
              {[
                { icon: '🎓', label: 'Free Forever' },
                { icon: '💬', label: 'Live Support' },
                { icon: '🚀', label: 'Job-Ready Skills' },
                { icon: '🌍', label: 'Global Mentors' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function MouseGradient() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div
      className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(26,82,118,0.10) 0%, transparent 50%)`,
      }}
    />
  );
}
