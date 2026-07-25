import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

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
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#FAF6F0] overflow-hidden select-none px-2"
        >
          {/* Ambient Warm Glow behind logo */}
          <div className="absolute w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] rounded-full bg-[#8C4A27]/10 blur-3xl pointer-events-none" />

          {/* Centered Brand Animation Container */}
          <div className="relative flex items-center justify-center w-full max-w-lg mx-auto z-10">
            
            {/* Left Word: Brownies */}
            <motion.h1
              initial={{ x: 15, opacity: 0 }}
              animate={{
                x: [15, 0, -28, -48],
                opacity: [0, 1, 1, 1]
              }}
              transition={{
                duration: 1.9,
                times: [0, 0.2, 0.55, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold text-[#2C1A14] tracking-tight shrink-0"
            >
              Brownies
            </motion.h1>

            {/* Center Animated Opening Gift Box Icon */}
            <div className="relative mx-1 sm:mx-3 flex items-center justify-center shrink-0">
              
              {/* Lowercase 'n' initially visible in title */}
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: [1, 0, 0], scale: [1, 0.5, 0] }}
                transition={{ duration: 0.65, times: [0, 0.3, 1] }}
                className="font-serif text-xl sm:text-4xl md:text-5xl text-[#8C4A27] italic font-semibold absolute"
              >
                n
              </motion.span>

              {/* Gift Box Container */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1]
                }}
                transition={{
                  delay: 0.35,
                  duration: 0.6,
                  ease: "backOut"
                }}
                className="relative flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16"
              >
                {/* Floating Particles (Sparkle + Heart) rising from box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.9], y: [0, -16, -24], x: [-4, 6, 2] }}
                  transition={{ delay: 0.85, duration: 0.9 }}
                  className="absolute -top-3 left-0 text-[#8C4A27]"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-[#8C4A27]/20 text-[#8C4A27]" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.8], y: [0, -14, -22], x: [4, -4, -8] }}
                  transition={{ delay: 0.95, duration: 0.85 }}
                  className="absolute -top-3 right-0 text-[#F06292]"
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#F06292] text-[#F06292]" />
                </motion.div>

                {/* Vector Gift Box with Flipping Lid */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-9 h-9 sm:w-14 sm:h-14 overflow-visible drop-shadow-sm"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Gift Box Base */}
                  <rect x="14" y="28" width="36" height="26" rx="4" fill="#8C4A27" />
                  <rect x="29" y="28" width="6" height="26" fill="#F06292" />
                  <rect x="14" y="28" width="36" height="4" fill="#733C21" opacity="0.3" />

                  {/* Flipping Box Lid */}
                  <motion.g
                    initial={{ y: 0, rotate: 0 }}
                    animate={{
                      y: [0, -4, -14],
                      rotate: [0, -6, -26]
                    }}
                    transition={{
                      delay: 0.85,
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <rect x="11" y="20" width="42" height="9" rx="2" fill="#733C21" />
                    <rect x="29" y="20" width="6" height="9" fill="#F06292" />
                    {/* Ribbon Bow */}
                    <path
                      d="M25 15C22 10 27 8 32 17C37 8 42 10 39 15Z"
                      fill="#F06292"
                    />
                    <circle cx="32" cy="17" r="2.5" fill="#FAF6F0" />
                  </motion.g>
                </svg>

              </motion.div>
            </div>

            {/* Right Word: Frames */}
            <motion.h1
              initial={{ x: -15, opacity: 0 }}
              animate={{
                x: [-15, 0, 28, 48],
                opacity: [0, 1, 1, 1]
              }}
              transition={{
                duration: 1.9,
                times: [0, 0.2, 0.55, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold text-[#2C1A14] tracking-tight shrink-0"
            >
              Frames
            </motion.h1>

          </div>

          {/* Subtitle / Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: [0, 0, 1], y: [12, 12, 0] }}
            transition={{ duration: 1.9, times: [0, 0.55, 1], ease: "easeOut" }}
            className="absolute bottom-12 sm:bottom-16 text-center z-10"
          >
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8C4A27] bg-[#8C4A27]/5 px-3 py-1 rounded-full border border-[#8C4A27]/10">
              CUSTOMIZED GIFT STUDIO
            </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
