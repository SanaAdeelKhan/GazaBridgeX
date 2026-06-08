// src/theme/colors.js
// ── GazaBridgeX Design System ─────────────────────────────────────────────────
// Single source of truth for all colors. Import this wherever you need colors.
// Usage: import { colors, gradients } from '../theme/colors';
//        style={{ background: gradients.accent }}
//        className={`bg-[${colors.card}]`}   ← for one-offs
// Prefer Tailwind CSS variable classes (bg-gaza-card etc.) over inline styles.

export const colors = {
  // Page & Layout
  pageBg:          '#F2DDD8', // blush pink — page background
  sidebar:         '#4B5563', // sidebar & header background
  sidebarBorder:   '#374151', // sidebar & header border

  // Cards
  card:            '#d4e0a0', // olive — all main cards
  cardBorder:      '#a8bc6a', // olive border

  // Dropdown (header only)
  dropdown:        '#FDF8F5',
  dropdownBorder:  '#E8B4B0',

  // Text
  title:           '#1e3a5f', // navy — headings, card titles
  body:            '#2d4a2d', // dark green — card body text
  white:           '#FFFFFF',
  secondary:       '#D1D5DB', // sidebar inactive text
  muted:           '#CBD5E1', // section labels

  // Accent
  accentStart:     '#C26100', // amber gradient start
  accentEnd:       '#E07A1B', // amber gradient end

  // Badges
  badge:           '#EC4899', // notification pink

  // Profile banner
  bannerStart:     '#1e3a5f',
  bannerEnd:       '#2d5a8e',
};

// Pre-built gradient strings for inline styles
export const gradients = {
  accent:  `linear-gradient(to right, ${colors.accentStart}, ${colors.accentEnd})`,
  banner:  `linear-gradient(to right, ${colors.bannerStart}, ${colors.bannerEnd})`,
  avatar:  `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})`,
};

// Tailwind class helpers — use these for cleaner JSX
export const tw = {
  pageBg:       'bg-[#F2DDD8]',
  card:         'bg-[#d4e0a0] border border-[#a8bc6a]',
  accentBtn:    'bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white',
  cancelBtn:    'bg-[#F2DDD8] text-[#1e3a5f]',
  titleText:    'text-[#1e3a5f]',
  bodyText:     'text-[#2d4a2d]',
  tabActive:    'bg-[#1e3a5f] text-white',
  tabInactive:  'bg-[#2d5a8e]/20 text-[#1e3a5f]',
  filterCard:   'bg-[#d4e0a0] border border-[#a8bc6a] rounded-2xl shadow-lg p-6',
};

export default colors;
