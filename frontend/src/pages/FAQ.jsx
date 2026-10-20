// frontend/src/pages/FAQ.jsx
// Retheme: navy/gold/olive design system (colors.js) â€” matches Home.jsx / HowItWorks.jsx / Services.jsx / AboutUs.jsx

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
import SEO from '../components/SEO';
import { useAppTranslation } from '../hooks/useAppTranslation';

const arabicFaq = [
  ['Ù‡Ù„ ØºØ²Ø© Ø¨Ø±ÙŠØ¯Ø¬ Ù…Ø¬Ø§Ù†ÙŠØ©ØŸ', 'Ù†Ø¹Ù…ØŒ Ù…Ø¬Ø§Ù†ÙŠØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ù„Ù„Ø¬Ù…ÙŠØ¹ØŒ Ù„Ù„Ù…ØªØ·ÙˆØ¹ÙŠÙ† ÙˆØ£Ù‡Ù„ ØºØ²Ø© Ø¹Ù„Ù‰ Ø­Ø¯ Ø³ÙˆØ§Ø¡. Ù†Ø¤Ù…Ù† Ø¨Ø£Ù† Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ù…ØªØ§Ø­Ø§Ù‹ Ù„Ù„Ø¬Ù…ÙŠØ¹ ÙˆÙ„Ø§ Ù†ÙØ±Ø¶ Ø£ÙŠ Ø±Ø³ÙˆÙ… Ø¹Ù„Ù‰ Ø®Ø¯Ù…Ø§ØªÙ†Ø§.'],
  ['ÙƒÙŠÙ Ø£ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ù…ØªØ·ÙˆØ¹ØŸ', 'Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ "Ù…Ø±Ø§Ø³Ù„Ø©" ÙÙŠ Ø£ÙŠ Ø¨Ø·Ø§Ù‚Ø© Ù…ØªØ·ÙˆØ¹ Ù„Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø§Ù„Ù…Ù†ØµØ©. ÙŠÙ…ÙƒÙ†Ùƒ Ø£ÙŠØ¶Ø§Ù‹ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø±Ù‚Ù… WhatsApp Ø£Ùˆ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø¥Ù„Ù‰ Ù…Ø¬Ù…ÙˆØ¹Ø© WhatsApp Ø¥Ø°Ø§ Ø£Ø¶Ø§ÙÙ‡Ø§ Ø§Ù„Ù…ØªØ·ÙˆØ¹ Ø¥Ù„Ù‰ Ù…Ù„ÙÙ‡.'],
  ['Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø£Ù† Ø£ÙƒÙˆÙ† Ù…ØªØ·ÙˆØ¹Ø§Ù‹ ÙˆØ¨Ø§Ø­Ø«Ø§Ù‹ Ø¹Ù† Ù…Ø³Ø§Ø¹Ø¯Ø©ØŸ', 'Ù†Ø¹Ù…! Ø¹Ù†Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¯ÙˆØ±ÙŠÙ†. ÙŠØ¹Ù„Ù‘Ù… ÙƒØ«ÙŠØ± Ù…Ù† Ø£ÙØ±Ø§Ø¯ Ù…Ø¬ØªÙ…Ø¹Ù†Ø§ Ù…Ù‡Ø§Ø±Ø© ÙˆÙŠØªØ¹Ù„Ù…ÙˆÙ† Ø£Ø®Ø±Ù‰ØŒ ÙˆÙ‡Ø°Ø§ ÙŠØ´Ø¬Ø¹ Ø¹Ù„Ù‰ Ø¨Ù†Ø§Ø¡ Ù…Ø¬ØªÙ…Ø¹ Ø£Ù‚ÙˆÙ‰ ÙˆØ£ÙƒØ«Ø± ØªØ¹Ø§ÙˆÙ†Ø§Ù‹.'],
  ['Ù…Ø§ Ø§Ù„Ù„ØºØ§Øª Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø©ØŸ', 'ØªØ¯Ø¹Ù… Ø§Ù„Ù…Ù†ØµØ© Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù„ØºØ§Øª. ÙŠÙ…ÙƒÙ†Ùƒ ÙƒØªØ§Ø¨Ø© Ø¹Ø±ÙˆØ¶Ùƒ ÙˆØ·Ù„Ø¨Ø§ØªÙƒ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ø£Ùˆ Ø£ÙŠ Ù„ØºØ© Ø£Ø®Ø±Ù‰. Ù„Ø¯ÙŠÙ†Ø§ Ù…ØªØ·ÙˆØ¹ÙˆÙ† ÙˆØ¨Ø§Ø­Ø«ÙˆÙ† Ù…Ù† Ø®Ù„ÙÙŠØ§Øª Ù„ØºÙˆÙŠØ© Ù…ØªÙ†ÙˆØ¹Ø©.'],
  ['Ù‡Ù„ Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ Ø§Ù„Ø´Ø®ØµÙŠØ© Ø¢Ù…Ù†Ø©ØŸ', 'Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ Ø¸Ø§Ù‡Ø± Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ† ÙÙ‚Ø·. Ø£Ù†Øª ØªØªØ­ÙƒÙ… ÙÙŠ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„ØªÙŠ ØªØ´Ø§Ø±ÙƒÙ‡Ø§. Ù„Ø§ Ù†Ø¨ÙŠØ¹ Ø£Ùˆ Ù†Ø´Ø§Ø±Ùƒ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© Ù…Ø¹ Ø£Ø·Ø±Ø§Ù Ø®Ø§Ø±Ø¬ÙŠØ©ØŒ ÙˆÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø®ÙØ§Ø¡ Ø£Ùˆ Ø¥Ø¸Ù‡Ø§Ø± ØªÙØ§ØµÙŠÙ„ Ø§Ù„ØªÙˆØ§ØµÙ„ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª.'],
  ['Ù…Ù† ÙŠÙ…ÙƒÙ†Ù‡ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… ÙƒÙ…ØªØ·ÙˆØ¹ØŸ', 'ÙŠÙ…ÙƒÙ† Ù„Ø£ÙŠ Ø´Ø®Øµ Ù„Ø¯ÙŠÙ‡ Ù…Ù‡Ø§Ø±Ø§Øª Ù„Ù…Ø´Ø§Ø±ÙƒØªÙ‡Ø§ Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù… ÙƒÙ…ØªØ·ÙˆØ¹! Ø³ÙˆØ§Ø¡ ÙƒÙ†Øª Ù…Ø·ÙˆØ±Ø§Ù‹ Ø£Ùˆ Ù…ØµÙ…Ù…Ø§Ù‹ Ø£Ùˆ Ù…Ø³ÙˆÙ‚Ø§Ù‹ Ù…Ø­ØªØ±ÙØ§Ù‹ Ø£Ùˆ ØªÙ…ØªÙ„Ùƒ Ù…Ù‡Ø§Ø±Ø§Øª Ù‚ÙŠÙ‘Ù…Ø© Ø£Ø®Ø±Ù‰ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø­Ø¯Ø§Ø« ÙØ±Ù‚. ÙŠØ£ØªÙŠ Ø§Ù„Ù…ØªØ·ÙˆØ¹ÙˆÙ† Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„Ù….'],
  ['Ù‡Ù„ ÙŠØ¬Ø¨ Ø£Ù† Ø£ÙƒÙˆÙ† Ù…Ù† ØºØ²Ø© Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©ØŸ', 'Ø±ØºÙ… Ø£Ù† ØªØ±ÙƒÙŠØ²Ù†Ø§ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù‡Ùˆ Ø¯Ø¹Ù… Ø£Ù‡Ù„ ØºØ²Ø©ØŒ ÙØ¥Ù† Ù…Ù†ØµØªÙ†Ø§ Ù…ÙØªÙˆØ­Ø© Ù„Ù„Ø¨Ø§Ø­Ø«ÙŠÙ† Ø¹Ù† Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† Ø£ÙŠ Ù…ÙƒØ§Ù†. Ø±Ø³Ø§Ù„ØªÙ†Ø§ Ù‡ÙŠ Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙŠØ­ØªØ§Ø¬ÙˆÙ† Ø¥Ù„Ù‰ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©ØŒ Ù…Ø¹ Ø§Ù‡ØªÙ…Ø§Ù… Ø®Ø§Øµ Ø¨Ù…Ø¬ØªÙ…Ø¹ ØºØ²Ø©.'],
  ['ÙƒÙŠÙ Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ø§Ù‹ØŸ', 'Ø§Ø¶ØºØ· Ø¨Ø¨Ø³Ø§Ø·Ø© Ø¹Ù„Ù‰ "Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù†" ÙˆØ³Ø¬Ù‘Ù„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø­Ø³Ø§Ø¨ Google Ø£Ùˆ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ. ØªØ³ØªØºØ±Ù‚ Ø§Ù„Ø¹Ù…Ù„ÙŠØ© Ø£Ù‚Ù„ Ù…Ù† Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†. Ø¨Ø¹Ø¯ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø¥ÙƒÙ…Ø§Ù„ Ù…Ù„ÙÙƒ ÙˆØ§Ù„Ø¨Ø¯Ø¡ Ø¨Ø§Ù„ØªÙˆØ§ØµÙ„ ÙÙˆØ±Ø§Ù‹.'],
  ['Ù…Ø§ Ù†ÙˆØ¹ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„ØªÙŠ ÙŠÙ…ÙƒÙ†Ù†ÙŠ ØªØ¹Ù„Ù…Ù‡Ø§ØŸ', 'ÙŠÙ…ÙƒÙ†Ùƒ ØªØ¹Ù„Ù… Ù…Ø¬Ù…ÙˆØ¹Ø© ÙˆØ§Ø³Ø¹Ø© Ù…Ù† Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©ØŒ Ù…Ù†Ù‡Ø§ ØªØ·ÙˆÙŠØ± Ø§Ù„ÙˆÙŠØ¨ ÙˆØªØµÙ…ÙŠÙ… UI/UX ÙˆØ§Ù„ØªØ³ÙˆÙŠÙ‚ Ø§Ù„Ø±Ù‚Ù…ÙŠ ÙˆØ¹Ù„Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØªØ·ÙˆÙŠØ± ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ù‡Ø§ØªÙ ÙˆØ§Ù„Ù„ØºØ© Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© ÙˆØºÙŠØ± Ø°Ù„Ùƒ. Ù†Ù‚Ø¯Ù… Ø£ÙŠØ¶Ø§Ù‹ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ù…Ù‡Ù†ÙŠ ÙˆØ®Ø¯Ù…Ø§Øª Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©.'],
  ['ÙƒÙŠÙ ÙŠØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ù…ØªØ·ÙˆØ¹ÙŠÙ†ØŸ', 'ÙŠÙ…Ø± Ø§Ù„Ù…ØªØ·ÙˆØ¹ÙˆÙ† Ø¨Ø¹Ù…Ù„ÙŠØ© Ù…Ø±Ø§Ø¬Ø¹Ø© Ù„Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ. Ø±ØºÙ… Ø£Ù†Ù†Ø§ Ù„Ø§ Ù†Ø¬Ø±ÙŠ ÙØ­ÙˆØµØ§Øª Ø®Ù„ÙÙŠØ© Ø±Ø³Ù…ÙŠØ©ØŒ ÙØ¥Ù†Ù†Ø§ Ù†Ø±Ø§Ù‚Ø¨ Ù†Ø´Ø§Ø· Ø§Ù„Ù…Ù†ØµØ© ÙˆÙ†Ø´Ø¬Ø¹ Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ù…Ø¬ØªÙ…Ø¹. ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø£ÙŠ Ù…Ø®Ø§ÙˆÙ Ù„ÙØ±ÙŠÙ‚Ù†Ø§.'],
  ['Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ù†ÙŠ ØªÙ‚Ø¯ÙŠÙ… Ù…Ù‡Ø§Ø±Ø§Øª Ù…ØªØ¹Ø¯Ø¯Ø© ÙƒÙ…ØªØ·ÙˆØ¹ØŸ', 'Ø¨Ø§Ù„ØªØ£ÙƒÙŠØ¯! ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¯Ø±Ø§Ø¬ Ø¬Ù…ÙŠØ¹ Ù…Ù‡Ø§Ø±Ø§ØªÙƒ ÙÙŠ Ù…Ù„ÙÙƒ ÙˆØ¥Ù†Ø´Ø§Ø¡ Ø¹Ø±ÙˆØ¶ Ù…ØªØ¹Ø¯Ø¯Ø©. ÙŠØ³Ø§Ø¹Ø¯ Ø°Ù„Ùƒ Ø§Ù„Ø¨Ø§Ø­Ø«ÙŠÙ† Ø¹Ù† Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© ÙÙŠ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„ÙŠÙƒ Ù„Ø£Ù†ÙˆØ§Ø¹ Ù…Ø®ØªÙ„ÙØ© Ù…Ù† Ø§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„Ø§Ø³ØªÙØ§Ø¯Ø© Ù…Ù† Ø®Ø¨Ø±ØªÙƒ.'],
  ['ÙƒÙŠÙ Ø£Ø¨Ù„Øº Ø¹Ù† Ø³Ù„ÙˆÙƒ ØºÙŠØ± Ù„Ø§Ø¦Ù‚ØŸ', 'Ø¥Ø°Ø§ ÙˆØ§Ø¬Ù‡Øª Ø£ÙŠ Ù…Ø´ÙƒÙ„Ø©ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø§Ù„Ù…Ù†ØµØ© Ø£Ùˆ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ù„Ù‰ gazabridgex@gmail.com. Ù†ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª Ø¨Ø¬Ø¯ÙŠØ© ÙˆÙ†ØªØ®Ø° Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ù…Ø¬ØªÙ…Ø¹ Ø¢Ù…Ù†.'],
];

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
  const { language } = useAppTranslation();
  const question = language === 'ar' ? arabicFaq[index][0] : faq.question;
  const answer = language === 'ar' ? arabicFaq[index][1] : faq.answer;

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
            {question}
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
              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>{answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function FAQ() {
  const { t } = useAppTranslation();
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
                <textPath href="#ring-faq">12 QUESTIONS â€¢ ALL ANSWERS â€¢ 12 QUESTIONS â€¢ </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: colors.gold, boxShadow: '0 10px 25px rgba(212,160,23,0.4)' }}>
              <span className="text-white text-xl">âœ¦</span>
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
              <span className="text-sm font-semibold" style={{ color: colors.title }}>{faqData.length} {t('faq.questionsAnswered')}</span>
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
                {t('faq.questions')}
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
              Everything you need to know about GazaBridge â€” how it works, who it's for, and why it's free.
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
                placeholder={t('faq.searchPlaceholder')}
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
                {search ? t('faq.resultsFor', { count: filtered.length, suffix: filtered.length === 1 ? '' : 's', query: search }) : t('faq.allQuestions')}
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
                <div className="text-5xl mb-4">ðŸ”</div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: colors.headingDark }}>
                  No matches found
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.muted }}>{t('faq.tryDifferent')}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSearch('')}
                  className="px-6 py-3 text-white text-sm font-semibold rounded-full transition-colors"
                  style={{ backgroundColor: colors.sidebar }}
                >
                  {t('faq.clearSearch')}
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
              <div className="text-4xl mb-4">ðŸ’¬</div>
              <h3
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                {t('faq.stillQuestions')}
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
