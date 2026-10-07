import React from 'react';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RewardsBanner: React.FC = () => {
  const { openModal, setActiveTab } = useApp();

  return (
    <div className="space-y-4">
      {/* 1. Unlock Exclusive Rewards Card (Right Rail) */}
      <div
        onClick={() => openModal('redeem_rewards')}
        className="rounded-2xl p-4 bg-gradient-to-r from-[#0047AB] to-[#15803D] text-white shadow-md relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">
                Unlock Exclusive Rewards
              </h4>
              <p className="text-[11px] text-white/80 mt-0.5 leading-snug">
                Complete more challenges to unlock free airtime and vouchers!
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BottomBanner: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#071A3F] via-[#003A8C] to-[#0047AB] text-white p-5 sm:p-6 shadow-md border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Subtle geometric glows (NO foliage) */}
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#0047AB] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white">
            Save · Transact · Earn · Grow
          </h3>
          <p className="text-xs text-white/75 mt-0.5 font-medium">
            The more financial habits you build, the more rewards you unlock.
          </p>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('rewards')}
        className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#071A3F] font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer relative z-10"
      >
        <span>Check your rewards</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
