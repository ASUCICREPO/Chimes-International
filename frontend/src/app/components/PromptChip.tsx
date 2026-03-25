import { motion } from 'motion/react';

interface PromptChipProps {
  text: string;
  onClick: () => void;
}

export function PromptChip({ text, onClick }: PromptChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="px-4 py-2 rounded-full bg-white border border-gray-300 text-sm text-gray-700 hover:border-[#FF7900]/50 hover:bg-gray-50 transition-all"
    >
      {text}
    </motion.button>
  );
}