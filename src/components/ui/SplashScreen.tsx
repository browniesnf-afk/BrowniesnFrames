import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#FAF6F0] overflow-hidden select-none"
        >
          {/* Subtle Warm Background Radial Glow */}
          <div className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#8C4A27]/8 blur-3xl pointer-events-none" />

          {/* Centered Content Container */}
          <div className="relative flex flex-col items-center justify-center px-4 z-10 space-y-4 sm:space-y-6">
            
            {/* 1. Closed Gift Box -> Animates OPENING */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              {/* Magic Sparkle Glow Particle on Lid Opening */}
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1], y: [0, -16, -22] }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -top-4 text-[#C87533] z-20"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 fill-[#C87533]/20" />
              </motion.div>

              {/* Gift Box SVG with Flipping/Lifting Lid */}
              <svg
                viewBox="0 0 64 64"
                className="w-16 h-16 sm:w-20 sm:h-20 overflow-visible drop-shadow-md"
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
                    y: [0, -5, -18],
                    rotate: [0, -6, -32]
                  }}
                  transition={{
                    delay: 0.45,
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

            {/* 2. Brand Text 'BrowniesnFrames' Reveals in Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#2C1A14] tracking-tight">
                Brownies<span className="text-[#8C4A27] italic">n</span>Frames
              </h1>
              <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#8C4A27] font-sans">
                Gourmet Treats • Custom Memories
              </p>
            </motion.div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
