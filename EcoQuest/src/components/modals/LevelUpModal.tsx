import React from 'react';
import { Award, ChevronRight, Crown, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LevelUpModal: React.FC = () => {
  const { showLevelUp, dismissLevelUp } = useApp();

  if (!showLevelUp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#071A3F] to-[#003A8C] text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/20 relative text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#22C55E]/30 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={dismissLevelUp}
          className="absolute right-4 top-4 p-1.5 rounded-full text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Badge Pop */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#0047AB] p-1 shadow-xl flex items-center justify-center border-2 border-white/30 animate-bounce">
          <div className="w-full h-full bg-[#071A3F] rounded-[20px] flex flex-col items-center justify-center">
            <Crown className="w-8 h-8 text-[#22C55E]" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[#22C55E] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Milestone Reached!</span>
        </div>

        <h3 className="text-2xl font-black text-white mt-1">
          Level {showLevelUp.index} Unlocked
        </h3>
        <p className="text-base font-bold text-[#4ADE80]">{showLevelUp.name}</p>

        <p className="text-xs text-white/75 mt-3 leading-relaxed">
          Congratulations! Your disciplined saving and digital habit tracking has elevated your rank.
          You've unlocked higher tier benefits and exclusive reward catalogue access!
        </p>

        <button
          onClick={dismissLevelUp}
          className="mt-6 w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#071A3F] font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Claim & Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
