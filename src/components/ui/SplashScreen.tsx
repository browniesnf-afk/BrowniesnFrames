import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    // Only show if not already played in this browser session
    try {
      const hasSeenSplash = sessionStorage.getItem('browniesnframes_splash_shown');
      return !hasSeenSplash;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (!isVisible) return;

    try {
      sessionStorage.setItem('browniesnframes_splash_shown', 'true');
    } catch (e) {}

    // Automatically hide splash after 2.3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#FAF6F0] overflow-hidden select-none"
        >
          {/* Subtle Warm Background Radial Glow */}
          <div className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#8C4A27]/8 blur-3xl pointer-events-none" />

          {/* Centered Brand Animation Container */}
          <div className="relative flex items-center justify-center px-4 z-10">
            
            {/* Left Word: Brownies */}
            <motion.h1
              initial={{ x: 20, opacity: 0 }}
              animate={{
                x: [20, 0, -40, -65],
                opacity: [0, 1, 1, 1]
              }}
              transition={{
                duration: 1.9,
                times: [0, 0.2, 0.5, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#2C1A14] tracking-tight whitespace-nowrap"
            >
              Brownies
            </motion.h1>

            {/* Center Animated Opening Gift Box Icon */}
            <div className="relative mx-1 sm:mx-3 flex items-center justify-center">
              
              {/* Lowercase 'n' initially visible in title */}
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: [1, 0, 0], scale: [1, 0.5, 0] }}
                transition={{ duration: 0.7, times: [0, 0.3, 1] }}
                className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#8C4A27] italic absolute"
              >
                n
              </motion.span>

              {/* Gift Box Reveal Container */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.25, 1],
                  opacity: [0, 1, 1]
                }}
                transition={{
                  delay: 0.4,
                  duration: 0.65,
                  ease: "backOut"
                }}
                className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16"
              >
                {/* Magic Sparkle Glow Particle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 1], y: [5, -12, -18] }}
                  transition={{ delay: 0.9, duration: 0.85 }}
                  className="absolute -top-3 text-[#C87533]"
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-[#C87533]/20" />
                </motion.div>

                {/* Animated Gift Box SVG */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-10 h-10 sm:w-14 sm:h-14 overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Gift Box Base Body */}
                  <rect x="14" y="28" width="36" height="26" rx="4" fill="#8C4A27" />
                  <rect x="29" y="28" width="6" height="26" fill="#F06292" />

                  {/* Flipping Box Lid */}
                  <motion.g
                    initial={{ y: 0, rotate: 0 }}
                    animate={{
                      y: [0, -4, -14],
                      rotate: [0, -5, -28]
                    }}
                    transition={{
                      delay: 0.9,
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <rect x="10" y="20" width="44" height="9" rx="2" fill="#733C21" />
                    <rect x="29" y="20" width="6" height="9" fill="#F06292" />
                    {/* Ribbon Bow */}
                    <path
                      d="M26 16C23 12 28 10 32 18C36 10 41 12 38 16Z"
                      fill="#F06292"
                    />
                  </motion.g>
                </svg>

              </motion.div>
            </div>

            {/* Right Word: Frames */}
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: [-20, 0, 40, 65],
                opacity: [0, 1, 1, 1]
              }}
              transition={{
                duration: 1.9,
                times: [0, 0.2, 0.5, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#2C1A14] tracking-tight whitespace-nowrap"
            >
              Frames
            </motion.h1>

          </div>

          {/* Elegant Subtitle Tagline Below */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: [0, 0, 1], y: [15, 15, 0] }}
            transition={{ duration: 2, times: [0, 0.5, 1], ease: "easeOut" }}
            className="absolute bottom-14 sm:bottom-20 text-center z-10"
          >
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#8C4A27]">
              Gourmet Treats • Custom Memories
            </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
