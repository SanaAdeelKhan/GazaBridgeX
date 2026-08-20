// frontend/src/components/RatingStars.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import colors from '../theme/colors';

export default function RatingStars({
    value = 0,
    onChange = null,
    size = 'lg',
    readOnly = false,
    showValue = false
}) {
    const [hoveredStar, setHoveredStar] = useState(0);

    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-9 h-9',
        xl: 'w-12 h-12',
    };

    const starSize = sizes[size] || sizes.lg;

    const handleStarClick = (starValue) => {
        if (readOnly || !onChange) return;
        onChange(starValue);
    };

    const handleStarHover = (starValue) => {
        if (readOnly || !onChange) return;
        setHoveredStar(starValue);
    };

    const displayValue = hoveredStar || value;

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayValue;
                    const isHovered = star === hoveredStar;

                    return (
                        <motion.button
                            key={star}
                            type="button"
                            disabled={readOnly}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={() => handleStarHover(0)}
                            whileHover={!readOnly ? { scale: 1.2, rotate: 5 } : {}}
                            whileTap={!readOnly ? { scale: 0.9 } : {}}
                            animate={isFilled ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`${starSize} ${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none relative`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.svg
                                    key={isFilled ? 'filled' : 'empty'}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-full"
                                    viewBox="0 0 24 24"
                                    fill={isFilled ? colors.gold : 'none'}
                                    stroke={isFilled ? colors.gold : colors.muted}
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                    />
                                </motion.svg>
                            </AnimatePresence>

                            {/* Glow effect on hover */}
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        boxShadow: `0 0 20px ${colors.goldGlow}`,
                                        backgroundColor: colors.goldLight,
                                        zIndex: -1
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {showValue && displayValue > 0 && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-bold ml-2"
                    style={{ color: colors.gold }}
                >
                    {displayValue}.0
                </motion.span>
            )}
        </div>
    );
}