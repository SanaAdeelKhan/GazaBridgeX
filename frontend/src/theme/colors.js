// src/theme/colors.js — GazaBridgeX Design System (solid colors, logo-matched)

export const colors = {
  sidebar:          '#374151',
  sidebarBorder:    '#4B5563',
  header:           '#374151',
  navText:          '#D1D5DB',
  navActive:        '#ffffff',
  navSection:       '#9CA3AF',

  pageBg:           '#f5f0e8',
  card:             '#ffffff',
  cardBorder:       '#e8dfd2',
  cardAlt:          '#faf8f4',

  title:            '#1c1a17',
  body:             '#3a3028',
  muted:            '#6b5e52',
  white:            '#ffffff',
  secondary:        '#a09485',

  // Solid amber — primary actions (NO gradient)
  primary:          '#e18f23',
  primaryHover:     '#c97a18',
  primaryLight:     '#fdf3e3',

  // Solid olive — secondary accents (NO gradient)
  olive:            '#626223',
  oliveHover:       '#4d4d1c',
  oliveLight:       '#f0efe0',

  badgeOpen:        '#e18f23',
  badgeOpenText:    '#fff8ee',
  badgeClosed:      '#8B1A1A',
  badgeClosedText:  '#fde8e8',
  badgeNew:         '#626223',
  badgeNewText:     '#f0efe0',

  statPositive:     '#626223',
  statPositiveBg:   '#f0efe0',

  bannerStart:      '#626223',
  bannerEnd:        '#626223',

  tabActiveBg:        '#626223',
  tabActiveText:      '#ffffff',
  tabActiveUnderline: '#e18f23',
  tabInactiveBg:      '#f0ece4',
  tabInactiveText:    '#6b5e52',
};

export const tw = {
  pageBg:        'bg-[#f5f0e8]',
  card:          'bg-white border border-[#e8dfd2]',
  cardAlt:       'bg-[#faf8f4] border border-[#e8dfd2]',
  accentBtn:     'bg-[#e18f23] text-white hover:bg-[#c97a18]',
  oliveBtn:      'bg-[#626223] text-white hover:bg-[#4d4d1c]',
  cancelBtn:     'bg-[#f5f0e8] text-[#3a3028] border border-[#e8dfd2]',
  titleText:     'text-[#1c1a17]',
  bodyText:      'text-[#3a3028]',
  mutedText:     'text-[#6b5e52]',
  tabActive:     'text-[#e18f23] border-b-2 border-[#e18f23]',
  tabInactive:   'text-[#6b5e52]',
  badgeOpen:     'bg-[#e18f23] text-[#fff8ee]',
  badgeClosed:   'bg-[#8B1A1A] text-[#fde8e8]',
  badgeNew:      'bg-[#f0efe0] text-[#626223]',
};

export default colors;
