import { motion } from 'motion/react';

interface LanguageToggleProps {
  language: 'en' | 'es';
  onChange: (language: 'en' | 'es') => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[#FFE8D6] rounded-lg p-1 border border-[#ff7900]/20 shadow-sm">
      <div className="flex gap-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onChange('en')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            language === 'en'
              ? 'bg-[#ff7900] text-white shadow-md'
              : 'text-[#004165] bg-white/50 hover:bg-white/80'
          }`}
        >
          EN
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onChange('es')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            language === 'es'
              ? 'bg-[#ff7900] text-white shadow-md'
              : 'text-[#004165] bg-white/50 hover:bg-white/80'
          }`}
        >
          ES
        </motion.button>
      </div>
    </div>
  );
}