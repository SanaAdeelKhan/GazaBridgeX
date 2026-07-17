// frontend/src/pages/FAQ.jsx
// Retheme: navy/gold/olive design system (colors.js) — matches Home.jsx / HowItWorks.jsx / Services.jsx / AboutUs.jsx

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { faqData } from '../data/faq';
import colors from '../theme/colors';

function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-faq">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-faq)" />
    </svg>
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
    <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
      backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(26,82,118,0.10) 0%, transparent 50%)`,
    }} />
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
      if (blobRef.current)
        blobRef.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);
  return (
    <div ref={blobRef} className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ willChange: 'transform' }}>
      <div className="w-full h-full rounded-full blur-[80px]" style={{ backgroundColor: colors.goldGlow }} />
    </div>
  );
}

function Magnetic({ children }) {
  return <>{children}</>;
}

function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm"
      style={{ borderColor: isOpen ? colors.gold : '#E8EAEC' }}
    >
      <div
        className="absolute top-0 left-0 w-full h-0.5 transition-transform duration-300 origin-left"
        style={{ background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldHover})`, transform: isOpen ? 'scaleX(1)' : 'scaleX(0)' }}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-7 py-5 text-left flex justify-between items-center bg-white hover:bg-gray-50/80 transition-colors group"
      >
        <div className="flex items-center gap-4 flex-1 pr-4">
          <span className="text-[11px] font-bold text-gray-300 font-mono flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-base font-semibold transition-colors duration-200 hover:text-[#D4A017]" style={{ color: colors.body }}>
            {faq.question}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 border"
          style={isOpen
            ? { backgroundColor: colors.gold, color: '#ffffff', borderColor: colors.goldHover }
            : { backgroundColor: colors.badgeNeutral, color: colors.muted, borderColor: '#E8EAEC' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="px-7 pb-6 pt-1 flex gap-4"
            >
              <div className="w-px flex-shrink-0 ml-[42px]" style={{ backgroundColor: colors.goldLight }} />
              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>{faq.answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function FAQ() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? faqData.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqData;

  return (
    <div style={{ backgroundColor: colors.primaryLight, fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, backgroundColor: colors.primaryLight }}
        className="relative min-h-[85vh] flex items-center overflow-hidden pt-24"
      >
        <NoiseOverlay />
        <MouseGradient />

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${colors.primaryGlow} 1px, transparent 1px), linear-gradient(90deg, ${colors.primaryGlow} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <motion.div style={{ y: heroY, borderColor: colors.ringBorderStrong }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]), borderColor: colors.ringBorderSoft }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]), backgroundColor: colors.oliveLight, opacity: 0.7 }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute top-36 right-24 hidden xl:block"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 112 112">
              <path id="ring-faq" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill={colors.gold} fontWeight="500" letterSpacing="3">
                <textPath href="#ring-faq">12 QUESTIONS • ALL ANSWERS • 12 QUESTIONS • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: colors.gold, boxShadow: '0 10px 25px rgba(212,160,23,0.4)' }}>
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-8">

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border"
              style={{ borderColor: colors.gold }}
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: colors.gold }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: colors.gold }} />
              </motion.span>
              <span className="text-sm font-semibold" style={{ color: colors.title }}>{faqData.length} Questions Answered</span>
            </motion.div>

            <div className="space-y-1 overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700, color: colors.headingDark }}
              >
                Got
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="italic leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700, color: colors.gold }}
              >
                Questions?
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700, color: colors.headingDark }}
              >
                We Have Answers.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.8 }}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: colors.muted }}
            >
              Everything you need to know about GazaBridge — how it works, who it's for, and why it's free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="relative max-w-md"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.muted }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 focus:border-[#D4A017]"
                style={{ color: colors.body, '--tw-ring-color': 'rgba(212,160,23,0.2)' }}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: colors.muted }}>scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full" style={{ backgroundColor: colors.muted }} />
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">

          <AnimatePresence mode="wait">
            <motion.div
              key={search}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="h-px w-8" style={{ backgroundColor: colors.gold }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: colors.gold }}>
                {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : 'All Questions'}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs" style={{ color: colors.muted }}>{filtered.length} total</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="space-y-3">
                {filtered.map((faq, index) => (
                  <FAQItem key={faq.question} faq={faq} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: colors.headingDark }}>
                  No matches found
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.muted }}>Try a different search term or browse all questions.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSearch('')}
                  className="px-6 py-3 text-white text-sm font-semibold rounded-full transition-colors"
                  style={{ backgroundColor: colors.sidebar }}
                >
                  Clear search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="mt-16 relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.sidebar} 0%, ${colors.primary} 55%, ${colors.secondary} 100%)` }} />
            <div className="absolute inset-0 overflow-hidden">
              <motion.div animate={{ x: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl" />
            </div>
            <NoiseOverlay />

            <div className="relative p-10 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Still have questions?
              </h3>
              <p className="text-white/70 mb-7 text-sm leading-relaxed max-w-sm mx-auto">
                Our team is here to help. Reach out any time and we'll get back to you.
              </p>
              <Magnetic>
                <motion.a
                  href="mailto:gazabridgex@gmail.com"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white font-bold rounded-full shadow-xl transition-colors duration-300 text-sm hover:bg-[#FCF3CF]"
                  style={{ color: colors.title }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  gazabridgex@gmail.com
                </motion.a>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
