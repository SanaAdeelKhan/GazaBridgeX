// src/theme/colors.js — BACKUP (original before GazaBridgeX theme v2)
// ── GazaBridgeX Design System ─────────────────────────────────────────────────
export const colors = {
  // Page & Layout
  pageBg:          '#F2DDD8',
  sidebar:         '#4B5563',
  sidebarBorder:   '#374151',
  // Cards (light navy-blue)
  card:            '#d8e4f0',
  cardBorder:      '#a8c4dc',
  // Dropdown (header only)
  dropdown:        '#FDF8F5',
  dropdownBorder:  '#E8B4B0',
  // Text — olive as seen in UI
  title:           '#3d4a00',
  body:            '#5a6600',
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
  cancelBtn:    'bg-[#F2DDD8] text-[#3d4a00]',
  titleText:    'text-[#3d4a00]',
  bodyText:     'text-[#5a6600]',
  tabActive:    'bg-[#1e3a5f] text-white',
  tabInactive:  'bg-[#d8e4f0] text-[#3d4a00]',
  filterCard:   'bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-lg p-6',
};
export default colors;
