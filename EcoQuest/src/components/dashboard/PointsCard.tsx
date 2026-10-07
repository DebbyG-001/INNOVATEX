import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PointsCard: React.FC = () => {
  const { user, openModal } = useApp();

  return (
    <div className="bg-gradient-to-br from-[#071A3F] via-[#003A8C] to-[#0047AB] rounded-2xl p-5 text-white border border-white/10 shadow-sm relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
            <Star className="w-5 h-5 fill-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70">Your Points</p>
            <p className="text-2xl font-black text-white font-mono tabular-nums leading-tight">
              {user.reward_points.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal('redeem_rewards')}
          className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#071A3F] font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          Redeem
        </button>
      </div>

      <p className="text-xs text-white/75 mt-4 leading-relaxed font-medium">
        Earn points for every transaction, complete challenges and unlock rewards!
      </p>
    </div>
  );
};
