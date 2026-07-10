// src/theme/colors.js — GazaBridge Design System (logo-matched: Blue + Gold + Olive)
export const colors = {

  // ─── SIDEBAR / HEADER ─────────────────────────────────────────────
  sidebar:          '#154360',   // Deep navy (dark blue header/sidebar)
  sidebarBorder:    '#1A5276',   // Brand blue as border
  header:           '#154360',
  headingDark:      '#0F3450',   // Custom deep navy — for strong page headings
  navText:          'rgba(255,255,255,0.80)',
  navActive:        '#ffffff',
  navSection:       'rgba(255,255,255,0.45)',
  navIndicator:     '#D4A017',   // Gold underline on active nav item

  // ─── PAGE & SURFACE ───────────────────────────────────────────────
  pageBg:           '#F4F6F7',   // Light grey (logo background)
  pageBgWarm:       '#FAF3E7',   // warm cream — for hero/heading sections
  heroBg:           '#F5E9D6',   // deeper cream — hero banners
  softAccent:       '#D9A491',   // dusty terracotta — sparing elegant accent
  card:             '#ffffff',
  cardBorder:       '#E8EAEC',
  cardAlt:          '#D4E6F1',   // Blue tint — featured cards
  cardGold:         '#FCF3CF',   // Gold tint — announcement cards
  cardOlive:        '#A9DFBF',   // Olive tint — success/nature cards

  // ─── TYPOGRAPHY ───────────────────────────────────────────────────
  title:            '#1A5276',   // Deep blue — h1, h2, h3
  subheading:       '#154360',   // Navy — h4, h5
  body:             '#1C2833',   // Charcoal — paragraphs
  muted:            '#717D7E',   // Grey — captions, meta
  white:            '#ffffff',
  secondary:        '#2E86C1',   // Sky blue — links, icons
  accent:           '#D4A017',   // Gold — highlights, quotes

  // ─── PRIMARY (BLUE) ───────────────────────────────────────────────
  primary:          '#1A5276',   // Deep blue — primary buttons, nav bg
  primaryHover:     '#154360',
  primaryLight:     '#D4E6F1',   // Blue tint bg

  // ─── SECONDARY (GOLD) ─────────────────────────────────────────────
  gold:             '#D4A017',   // Warm gold — CTA, donate, apply
  goldHover:        '#B7770D',
  goldLight:        '#FCF3CF',   // Gold tint bg

  // ─── ACCENT (OLIVE) ───────────────────────────────────────────────
  olive:            '#2E7D32',   // Olive green — peace accent, branch
  oliveHover:       '#1B5E20',
  oliveLight:       '#A9DFBF',   // Olive tint bg

  // ─── BADGES ───────────────────────────────────────────────────────
  badgeActive:      '#D4A017',   // Gold bg
  badgeActiveText:  '#ffffff',
  badgeOpen:        '#A9DFBF',   // Olive tint bg
  badgeOpenText:    '#2E7D32',
  badgePending:     '#FDEBD0',
  badgePendingText: '#E67E22',
  badgeClosed:      '#FADBD8',
  badgeClosedText:  '#C0392B',
  badgeNeutral:     '#E8EAEC',
  badgeNeutralText: '#717D7E',

  // ─── SEMANTIC ─────────────────────────────────────────────────────
  success:          '#1E8449',
  successBg:        '#A9DFBF',
  warning:          '#E67E22',
  warningBg:        '#FDEBD0',
  error:            '#C0392B',
  errorBg:          '#FADBD8',

  // ─── STATS ────────────────────────────────────────────────────────
  statPositive:     '#1E8449',
  statPositiveBg:   '#A9DFBF',

  // ─── BANNERS (hero / profile) ─────────────────────────────────────
  bannerStart:      '#1A5276',
  bannerEnd:        '#2E86C1',

  // ─── TABS ─────────────────────────────────────────────────────────
  tabActiveBg:        '#1A5276',
  tabActiveText:      '#ffffff',
  tabActiveUnderline: '#D4A017',   // Gold underline
  tabInactiveBg:      '#F4F6F7',
  tabInactiveText:    '#717D7E',

  // ─── FORMS ────────────────────────────────────────────────────────
  inputBg:          '#ffffff',
  inputBorder:      '#B0BEC5',
  inputBorderFocus: '#1A5276',
  inputText:        '#1C2833',
  inputPlaceholder: '#717D7E',
  label:            '#154360',

  // ─── DIVIDERS ─────────────────────────────────────────────────────
  divider:          '#E8EAEC',
  dividerStrong:    '#717D7E',

  // ─── FOOTER ───────────────────────────────────────────────────────
  footer:           '#1C2833',
  footerText:       'rgba(255,255,255,0.75)',

  // ─── ON-DARK SURFACES (navy full-bleed sections, e.g. landing-page
  //     Testimonials / Marquee strip) — translucent-white overlays that
  //     sit on top of colors.sidebar / colors.primary backgrounds ──────
  onDarkCard:        'rgba(255,255,255,0.04)',
  onDarkCardHover:   'rgba(255,255,255,0.07)',
  onDarkBorder:      'rgba(255,255,255,0.08)',
  onDarkBorderHover: 'rgba(255,255,255,0.15)',
  onDarkMuted:       'rgba(255,255,255,0.25)',
  onDarkWatermark:   'rgba(255,255,255,0.03)',

  // ─── GLOWS (soft blurred decorative orbs / faint grid overlays,
  //     used on light backgrounds like the landing-page hero) ────────
  ringBorderStrong: 'rgba(26,82,118,0.3)',   // Decorative hero ring — stronger navy border
  ringBorderSoft:   'rgba(26,82,118,0.18)',  // Decorative hero ring — softer navy border
  goldGlow:         'rgba(212,160,23,0.08)',
  oliveGlow:        'rgba(46,125,50,0.06)',
  primaryGlow:      'rgba(26,82,118,0.06)',

  // ─── WHITE OVERLAYS (decorative translucent-white blur shapes sitting
  //     on top of a solid brand-color card, e.g. the gold highlight card) ──
  overlayStrong:    'rgba(255,255,255,0.10)',
  overlaySoft:      'rgba(255,255,255,0.05)',
};

// ─── TAILWIND UTILITY CLASSES ──────────────────────────────────────────────
// Use these in className props — Tailwind needs hardcoded hex values
export const tw = {

  // Backgrounds
  pageBg:        'bg-[#F4F6F7]',
  card:          'bg-white border border-[#E8EAEC]',
  cardAlt:       'bg-[#D4E6F1] border border-[#2E86C1]',
  cardGold:      'bg-[#FCF3CF] border border-[#B7770D]',
  cardOlive:     'bg-[#A9DFBF] border border-[#1E8449]',

  // Buttons
  primaryBtn:    'bg-[#1A5276] text-white hover:bg-[#154360]',
  goldBtn:       'bg-[#D4A017] text-white hover:bg-[#B7770D]',
  oliveBtn:      'bg-[#2E7D32] text-white hover:bg-[#1B5E20]',
  ghostBtn:      'bg-transparent text-[#1A5276] border border-[#1A5276] hover:bg-[#D4E6F1]',
  dangerBtn:     'bg-[#C0392B] text-white hover:bg-[#922B21]',
  cancelBtn:     'bg-[#F4F6F7] text-[#1C2833] border border-[#E8EAEC]',

  // Typography
  titleText:     'text-[#1A5276]',
  subText:       'text-[#154360]',
  bodyText:      'text-[#1C2833]',
  mutedText:     'text-[#717D7E]',
  accentText:    'text-[#D4A017]',
  linkText:      'text-[#2E86C1] hover:text-[#154360]',

  // Navigation
  navBg:         'bg-[#1A5276]',
  navItem:       'text-white/80 hover:bg-white/10',
  navActive:     'text-white bg-white/15 border-b-2 border-[#D4A017]',

  // Tabs
  tabActive:     'text-[#1A5276] border-b-2 border-[#D4A017] bg-white',
  tabInactive:   'text-[#717D7E] hover:text-[#1A5276] bg-[#F4F6F7]',

  // Badges
  badgeActive:   'bg-[#D4A017] text-white',
  badgeOpen:     'bg-[#A9DFBF] text-[#2E7D32]',
  badgePending:  'bg-[#FDEBD0] text-[#E67E22]',
  badgeClosed:   'bg-[#FADBD8] text-[#C0392B]',
  badgeNeutral:  'bg-[#E8EAEC] text-[#717D7E]',

  // Banners
  bannerInfo:    'bg-[#D4E6F1] border-l-4 border-[#2E86C1] text-[#154360]',
  bannerSuccess: 'bg-[#A9DFBF] border-l-4 border-[#1E8449] text-[#2E7D32]',
  bannerWarning: 'bg-[#FDEBD0] border-l-4 border-[#E67E22] text-[#7D4A00]',
  bannerError:   'bg-[#FADBD8] border-l-4 border-[#C0392B] text-[#7B241C]',

  // Sidebar
  sidebar:       'bg-[#154360] border-r border-[#1A5276]',

  // Forms
  input:         'bg-white border border-[#E8EAEC] text-[#1C2833] placeholder-[#717D7E] focus:border-[#1A5276] focus:outline-none',
  label:         'text-[#154360] font-semibold',

  // Divider
  divider:       'border-[#E8EAEC]',

  // On-dark surfaces (landing page dark sections)
  onDarkCard:        'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]',
  onDarkCardActive:  'bg-white',
};

export default colors;
