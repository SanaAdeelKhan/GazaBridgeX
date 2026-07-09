// frontend/src/components/Footer.jsx
// Design system: Instrument Serif + DM Sans — matches Home.jsx
// Deps: framer-motion (already installed)

import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import colors from '../theme/colors';

// ─── Noise overlay ─────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-footer">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-footer)" />
    </svg>
  );
}

// ─── Marquee ───────────────────────────────────────────────────────────────
function FooterMarquee() {
  const words = [
    'Web Development', '✦', 'UI/UX Design', '✦', 'Data Science', '✦',
    'Digital Marketing', '✦', 'Career Coaching', '✦', 'Cybersecurity',
    '✦', 'Mobile Apps', '✦', 'AI & Machine Learning', '✦',
  ];
  const doubled = [...words, ...words];

  return (
    <div className="relative overflow-hidden border-b py-4" style={{ borderColor: colors.onDarkBorder }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        className="flex items-center gap-8 whitespace-nowrap"
      >
        {doubled.map((w, i) => (
          <span
            key={i}
            className="text-xs font-medium tracking-widest uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif", color: w === '✦' ? colors.gold : colors.onDarkMuted }}
          >
            {w}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Link data ────────────────────────────────────────────────────────────
const footerLinks = {
  Platform: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Services',     href: '/services' },
    { name: 'Resources',    href: '/resources' },
    { name: 'Community',    href: '/posts' },
    { name: 'FAQ',          href: '/faq' },
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Mission',  href: '/mission' },
    { name: 'Blog',     href: '/blog' },
  ],
  Community: [
    { name: 'Volunteers',      href: '/#' },
    { name: 'Success Stories', href: '/#' },
    { name: 'Forum',           href: '/#' },
    { name: 'Events',          href: '/#' },
  ],
  Legal: [
    { name: 'Privacy Policy',  href: '/privacy-policy' },
    { name: 'Terms of Service',href: '/terms-of-service' },
    { name: 'Cookie Policy',   href: '/cookie-policy' },
  ],
};

// ─── Social icons ─────────────────────────────────────────────────────────
const socials = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/gazabridge/posts/?feedView=all',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@gazabridge.org',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────
// MAIN FOOTER
// ─────────────────────────────────────────────────────────────────────────
export default function Footer() {
  const location  = useLocation();
  const footerRef = useRef(null);

  // Parallax big text
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const bgTextY = useTransform(scrollYProgress, [0, 1], [60, -20]);

  if (location.pathname === '/chat') return null;

  return (
    <footer
      ref={footerRef}
      className="relative text-white overflow-hidden"
      style={{ backgroundColor: colors.sidebar, fontFamily: "'DM Sans', sans-serif", '--gb-gold': colors.gold }}
    >
      <NoiseOverlay />

      {/* Grid lines — same as Home hero but subtler */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${colors.onDarkBorder} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.onDarkBorder} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: colors.goldGlow }} />
      <div className="absolute top-0 right-1/4 w-[300px] h-[200px] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: colors.oliveGlow }} />

      {/* Scrolling marquee strip */}
      <FooterMarquee />

      {/* ── Main grid ── */}
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">

        <div className="grid lg:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-x-8 gap-y-14 mb-20">

          {/* ── Brand column ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Logo */}
            <Link to="/" className="inline-flex items-center group">
              <div className="rounded-2xl overflow-hidden border-2 p-0 bg-white inline-flex flex-shrink-0" style={{ borderColor: colors.gold }}>
                <img src="/logo-full.png" alt="GazaBridge" className="h-32 w-[201px] object-contain" />
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: colors.onDarkMuted }}>
              Empowering people in Gaza through free digital skills education.
              Connecting passionate volunteers with talented learners — worldwide, forever free.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 hover:text-[var(--gb-gold)]"
                  style={{ backgroundColor: colors.onDarkCard, borderWidth: 1, borderColor: colors.onDarkBorder, color: colors.onDarkMuted }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>

            {/* Email chip */}
            <motion.a
              href="mailto:hello@gazabridge.org"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 text-xs transition-colors group hover:text-[var(--gb-gold)]"
              style={{ color: colors.onDarkMuted }}
            >
              <span className="w-1.5 h-1.5 rounded-full group-hover:animate-pulse" style={{ backgroundColor: colors.gold }} />
              hello@gazabridge.org
            </motion.a>
          </motion.div>

          {/* ── Link columns ── */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Category heading */}
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px w-4" style={{ backgroundColor: colors.onDarkBorder }} />
                <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: colors.onDarkMuted }}>
                  {category}
                </h4>
              </div>

              <ul className="space-y-2.5">
                {links.map((link, li) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.08 + li * 0.04, duration: 0.4 }}
                  >
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 text-sm transition-colors duration-200 hover:text-[var(--gb-gold)]"
                      style={{ color: colors.onDarkMuted }}
                    >
                      <motion.span
                        className="w-0 h-px group-hover:w-3 transition-all duration-300"
                        style={{ backgroundColor: colors.gold }}
                      />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: colors.onDarkBorder }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: colors.onDarkMuted }}>
              © {new Date().getFullYear()} GazaBridge.
            </span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.onDarkMuted }} />
            <span className="text-xs" style={{ color: colors.onDarkMuted }}>
              Made with{' '}
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="inline-block"
              >❤️</motion.span>
              {' '}for Gaza.
            </span>
          </div>

          {/* Centre — free badge */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: colors.goldLight + '1A', borderWidth: 1, borderColor: colors.gold + '33' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.gold }} />
            <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: colors.gold }}>
              100% Free Forever
            </span>
          </motion.div>

          {/* Right */}
          <div className="flex items-center gap-5">
            {[
              { name: 'Privacy Policy',   href: '/privacy-policy' },
              { name: 'Terms of Service', href: '/terms-of-service' },
            ].map((l) => (
              <Link
                key={l.name}
                to={l.href}
                className="text-xs transition-colors duration-200 hover:text-[var(--gb-gold)]"
                style={{ color: colors.onDarkMuted }}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Massive background wordmark — parallax ── */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          style={{ y: bgTextY }}
          className="text-center leading-none"
        >
          <span
            className="text-[clamp(6rem,18vw,16rem)] font-bold"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: colors.onDarkWatermark }}
          >
            GazaBridge
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
