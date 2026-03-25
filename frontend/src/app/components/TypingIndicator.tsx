import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="backdrop-blur-sm bg-white/80 border border-gray-200/50 rounded-2xl px-6 py-4 flex gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}