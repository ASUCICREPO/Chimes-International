import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { branding } from '../branding';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const handleSSOLogin = () => {
    // Simulate SSO authentication
    // In production, this would redirect to Microsoft EntraID
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#E3EEF8] via-[#F5E6FF] to-[#FFE6D9]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-[#A7C1E3] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#FFB380] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4B3E3] rounded-full blur-3xl"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glassmorphic Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              src={branding.logoPath}
              alt={branding.logoAlt}
              className="h-16"
            />
          </div>

          {/* Header Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl text-[#004165] mb-3">
              {branding.translations.en.loginWelcome}
            </h1>
            <p className="text-[#004165]/70">
              {branding.translations.en.loginSubtitle}
            </p>
          </motion.div>

          {/* SSO Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(255, 121, 0, 0.25)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSSOLogin}
            className="w-full bg-[#ff7900] text-white py-4 rounded-xl hover:bg-[#FC9F24] transition-all shadow-lg flex items-center justify-center gap-3 group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-lg">{branding.translations.en.ssoButton}</span>
          </motion.button>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-[#004165]/60 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Secure sign-in powered by Microsoft EntraID
            </p>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-[#004165]/10 text-center space-y-2"
          >
            <a href="#" className="block text-sm text-[#2A6EBB] hover:text-[#004165] transition-colors">
              Need help signing in?
            </a>
            <a href="#" className="block text-sm text-[#2A6EBB] hover:text-[#004165] transition-colors">
              Accessibility Options
            </a>
          </motion.div>
        </div>

        {/* Subtle tagline below card */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-6 text-sm text-[#004165]/70"
        >
          Your trusted companion for HR, IT, benefits, training, and policy questions
        </motion.p>
      </motion.div>
    </div>
  );
}
