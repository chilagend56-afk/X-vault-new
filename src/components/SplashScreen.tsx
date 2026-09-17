import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { BankLogo, BankMark } from './BankLogo';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const VERIFICATION_STEPS = [
  { text: "Initializing 256-bit TLS 1.3 secure session", detail: "Validating SSL certificate..." },
  { text: "Verifying client cryptographic device tokens", detail: "Hardware security check passed" },
  { text: "Authenticating FDIC-insured treasury core", detail: "Direct node connection established" },
  { text: "Synchronizing account portfolio & ledger", detail: "Multi-currency balance verified" },
  { text: "Security handshake complete. Opening vault...", detail: "Welcome to your private account" }
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { globalSettings } = useApp();
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds total for an authentic, snappy banking load

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      // Determine step based on percentage
      if (pct < 25) {
        setStepIndex(0);
      } else if (pct < 50) {
        setStepIndex(1);
      } else if (pct < 75) {
        setStepIndex(2);
      } else if (pct < 95) {
        setStepIndex(3);
      } else {
        setStepIndex(4);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentStep = VERIFICATION_STEPS[stepIndex];

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#070e1f] text-white selection:bg-blue-600 selection:text-white overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
        {/* Ambient radial glow behind the emblem */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[240px] h-[240px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      </div>

      {/* Top Header / Security Badge */}
      <header className="relative z-10 w-full pt-6 sm:pt-8 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-slate-300">
            TLS 1.3 Bank Grade Security
          </span>
        </div>

        <button 
          onClick={onComplete}
          className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
        >
          Skip <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      {/* Centerpiece: Vault Emblem & Real Bank Progress Sequence */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center">
        
        {/* Animated Brand Emblem */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Subtle Outer Pulsing Wave */}
          <div className="absolute -inset-3 rounded-3xl bg-blue-500/15 animate-pulse blur-sm" />
          
          <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center overflow-hidden ${
            globalSettings?.logo_url && globalSettings?.logo_mode !== 'default'
              ? 'p-0 bg-transparent border-0 shadow-none'
              : 'p-5 bg-gradient-to-tr from-[#0a1e3b] via-[#0f274a] to-[#1e3a8a] border border-white/20 shadow-2xl shadow-blue-900/50 text-white'
          }`}>
            {globalSettings?.logo_url && globalSettings?.logo_mode !== 'default' ? (
              <img 
                src={globalSettings.logo_url} 
                alt={globalSettings.website_name || 'Bank'} 
                className="w-full h-full object-contain"
              />
            ) : (
              <BankMark className="w-14 h-14" />
            )}
          </div>
        </motion.div>

        {/* Bank Title & Institutional Division */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white mb-1.5">
            {globalSettings?.website_name || 'SmartVault'}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/80">
            Digital Treasury & Private Wealth
          </p>
        </motion.div>

        {/* Progress Bar & Percentage Meter */}
        <div className="w-full max-w-[280px] sm:max-w-xs mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
              <Lock className="w-3 h-3 text-blue-400" />
              Secure Authentication
            </span>
            <span className="font-semibold text-blue-400">{progress}%</span>
          </div>

          {/* High-Precision Progress Track */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px] backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Live Multi-Stage Verification Log */}
        <div className="w-full min-h-[56px] flex flex-col items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200">
                {progress === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping flex-shrink-0" />
                )}
                <span className="truncate max-w-[270px] sm:max-w-xs">{currentStep.text}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 font-mono tracking-wide">
                {currentStep.detail}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Compliance & FDIC Regulatory Seals (Mobile-Safe Margin) */}
      <footer className="relative z-10 w-full pb-8 sm:pb-9 pt-4 px-6 flex flex-col items-center text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Member FDIC
          </span>
          <span className="text-slate-600">•</span>
          <span>Equal Housing Lender</span>
          <span className="text-slate-600">•</span>
          <span>256-Bit SSL</span>
        </div>

        <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-wider">
          EST. {new Date().getFullYear()} • REGULATED DIGITAL FINANCIAL INSTITUTION
        </p>
      </footer>
    </motion.div>
  );
};
