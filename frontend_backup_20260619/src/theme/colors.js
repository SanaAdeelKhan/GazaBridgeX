// src/theme/colors.js
// ── GazaBridgeX Design System v2 ──────────────────────────────────────────────
// Palette synthesized from: Palestine flag (black, white, green, red)
// refined through the GazaBridge logo (olive hands, amber dove, white bird).
// Flag lives subtly in the UI — never decorative, always intentional.

export const colors = {

  // ── Page & Layout ────────────────────────────────────────────────────────────
  pageBg:           '#f5f0e8',   // dove parchment — warm white, flag white refined
  sidebar:          '#1a2e1a',   // deep olive — flag green through the logo lens
  sidebarBorder:    '#243d24',   // slightly lighter olive for sidebar dividers
  header:           '#1a2e1a',   // matches sidebar for a unified shell

  // ── Cards & Surfaces ─────────────────────────────────────────────────────────
  card:             '#ffffff',   // pure white — clean content surfaces
  cardBorder:       '#e8dfd2',   // warm sand border — keeps warmth on white
  cardAlt:          '#faf8f4',   // off-white — alternate/nested cards
  dropdown:         '#ffffff',
  dropdownBorder:   '#e8dfd2',

  // ── Text ─────────────────────────────────────────────────────────────────────
  title:            '#1c1a17',   // kohl black — flag black, refined warm
  body:             '#3a3028',   // dark warm brown — readable, not harsh
  muted:            '#6b5e52',   // warm taupe — subtitles, descriptions
  white:            '#ffffff',
  secondary:        '#a09485',   // muted warm gray — placeholders, hints
  navText:          '#9ab89a',   // soft sage — default sidebar nav items
  navActive:        '#F7C760',   // warm gold — active nav item text
  navSection:       '#4a6b4a',   // dim green — nav section labels

  // ── Primary Accent (amber — from logo "Gaza" wordmark) ───────────────────────
  accentStart:      '#C97B1A',   // Palestine amber
  accentEnd:        '#E8920F',   // lighter amber for hover states
  accentGold:       '#F7C760',   // warm gold — active indicators, underlines

  // ── Flag Accent Strip (top of pages/modals — subtle nod to the flag) ─────────
  flagBlack:        '#1c1a17',
  flagWhite:        '#ffffff',
  flagAmber:        '#C97B1A',
  flagRed:          '#8B1A1A',   // dignified red — used ONLY for alert/closed badges

  // ── Badges ───────────────────────────────────────────────────────────────────
  badgeOpen:        '#C97B1A',   // amber — open/active
  badgeOpenText:    '#fff8ee',
  badgeClosed:      '#8B1A1A',   // dignified red — closed only
  badgeClosedText:  '#fde8e8',
  badgeLive:        '#8B1A1A',
  badgeLiveText:    '#fde8e8',
  badgeNew:         '#2d5a2d',   // forest green — new/success
  badgeNewText:     '#e8f0e8',

  // ── Stats & highlights ───────────────────────────────────────────────────────
  statPositive:     '#2d5a2d',   // green tint for positive stats
  statPositiveBg:   '#e8f0e8',
  statWarn:         '#8B4A00',   // amber-dark for neutral growth stats
  statWarnBg:       '#fdf3e3',

  // ── Profile banner ───────────────────────────────────────────────────────────
  bannerStart:      '#1a2e1a',   // deep olive — consistent with sidebar
  bannerEnd:        '#2d5a2d',   // forest mid — subtle depth

  // ── Tab system ───────────────────────────────────────────────────────────────
  tabActiveBg:      '#1a2e1a',
  tabActiveText:    '#ffffff',
  tabActiveUnderline: '#C97B1A',
  tabInactiveBg:    '#f0ece4',
  tabInactiveText:  '#6b5e52',
};

// ── Gradients ─────────────────────────────────────────────────────────────────
export const gradients = {
  accent:  `linear-gradient(to right, ${colors.accentStart}, ${colors.accentEnd})`,
  banner:  `linear-gradient(135deg, ${colors.bannerStart}, ${colors.bannerEnd})`,
  avatar:  `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})`,
  sidebar: `linear-gradient(180deg, ${colors.sidebar} 0%, #1f361f 100%)`,
  // The flag strip — use as a 3–4px top border on pages, modals, hero sections
  flagStrip: `linear-gradient(to right,
    ${colors.flagBlack} 0% 25%,
    ${colors.flagWhite} 25% 50%,
    ${colors.flagAmber} 50% 75%,
    ${colors.flagRed}   75% 100%)`,
};

// ── Tailwind shorthand classes ────────────────────────────────────────────────
export const tw = {
  pageBg:        'bg-[#f5f0e8]',
  card:          'bg-white border border-[#e8dfd2]',
  cardAlt:       'bg-[#faf8f4] border border-[#e8dfd2]',
  accentBtn:     'bg-gradient-to-r from-[#C97B1A] to-[#E8920F] text-white hover:opacity-90',
  cancelBtn:     'bg-[#f5f0e8] text-[#3a3028] border border-[#e8dfd2]',
  titleText:     'text-[#1c1a17]',
  bodyText:      'text-[#3a3028]',
  mutedText:     'text-[#6b5e52]',
  tabActive:     'bg-[#1a2e1a] text-white border-b-2 border-[#C97B1A]',
  tabInactive:   'bg-[#f0ece4] text-[#6b5e52]',
  filterCard:    'bg-white border border-[#e8dfd2] rounded-2xl shadow-sm p-6',
  sidebar:       'bg-[#1a2e1a]',
  badgeOpen:     'bg-[#C97B1A] text-[#fff8ee]',
  badgeClosed:   'bg-[#8B1A1A] text-[#fde8e8]',
  badgeNew:      'bg-[#e8f0e8] text-[#2d5a2d]',
  navItem:       'text-[#9ab89a] hover:text-[#F7C760] hover:bg-white/5',
  navItemActive: 'text-[#F7C760] bg-[#C97B1A]/12 border-l-[2.5px] border-[#C97B1A]',
};

export default colors;
