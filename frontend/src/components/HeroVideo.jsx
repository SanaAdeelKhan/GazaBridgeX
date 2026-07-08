// frontend/src/components/HeroVideo.jsx
// Reusable hero video card — replaces the static "Web Development" mockup.
// Autoplay/muted/loop MP4 with poster fallback and graceful <img> fallback on error.

import { useState } from 'react';
import { colors } from '../theme/colors';

export default function HeroVideo({
  videoSrc = '/videos/gaza_journey.mp4',
  posterSrc = '/images/gaza_journey_poster.jpg',
  className = '',
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div
      className={`relative w-72 max-w-full mx-auto rounded-3xl shadow-2xl border overflow-hidden ${className}`}
      style={{ height: '430px', borderColor: colors.cardBorder, backgroundColor: colors.card }}
    >
      {!videoFailed ? (
        <video
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          aria-label="Gaza student success journey from scholarship to career"
          onError={() => setVideoFailed(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          src={posterSrc}
          alt="Gaza student success journey from scholarship to career"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
        />
      )}

      {/* Subtle dark wash at bottom for badge legibility — solid, no gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} />

      {/* LIVE PLATFORM badge — top-left */}
      <div className="absolute top-4 left-4 z-20">
        <span
          className="text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase shadow-md"
          style={{ color: colors.gold, backgroundColor: colors.card }}
        >
          Live Platform
        </span>
      </div>
    </div>
  );
}
