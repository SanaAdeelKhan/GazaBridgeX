// src/theme/colors.js
// ── GazaBridgeX Design System ─────────────────────────────────────────────────

export const colors = {
  // Page & Layout
  pageBg:          '#F2DDD8', // blush pink — page background
  sidebar:         '#4B5563', // sidebar & header background
  sidebarBorder:   '#374151',

  // Cards (light navy-blue as seen in UI)
  card:            '#d8e4f0',
  cardBorder:      '#a8c4dc',

  // Dropdown (header only)
  dropdown:        '#FDF8F5',
  dropdownBorder:  '#E8B4B0',

  // Text
  title:           '#1e3a5f', // navy — headings, card titles
  body:            '#2d4a6e', // navy-blue body text
  white:           '#FFFFFF',
  secondary:       '#D1D5DB',
  muted:           '#CBD5E1',

  // Accent
  accentStart:     '#C26100',
  accentEnd:       '#E07A1B',

  // Badges
  badge:           '#EC4899',

  // Profile banner
  bannerStart:     '#1e3a5f',
  bannerEnd:       '#2d5a8e',
};

export const gradients = {
  accent:  `linear-gradient(to right, ${colors.accentStart}, ${colors.accentEnd})`,
  banner:  `linear-gradient(to right, ${colors.bannerStart}, ${colors.bannerEnd})`,
  avatar:  `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})`,
};

export const tw = {
  pageBg:       'bg-[#F2DDD8]',
  card:         'bg-[#d8e4f0] border border-[#a8c4dc]',
  accentBtn:    'bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white',
  cancelBtn:    'bg-[#F2DDD8] text-[#1e3a5f]',
  titleText:    'text-[#1e3a5f]',
  bodyText:     'text-[#2d4a6e]',
  tabActive:    'bg-[#1e3a5f] text-white',
  tabInactive:  'bg-[#d8e4f0] text-[#1e3a5f]',
  filterCard:   'bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-lg p-6',
};

export default colors;
