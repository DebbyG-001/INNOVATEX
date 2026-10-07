import React from 'react';
import {
  CheckCircle2,
  Gift,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/formatters';

export const RewardsView: React.FC = () => {
  const { user, rewards, redemptions, openModal } = useApp();

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'airtime':
        return Smartphone;
      case 'voucher':
        return ShoppingBag;
      case 'merch':
        return Gift;
      default:
        return Tag;
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#071A3F] via-[#003A8C] to-[#0047AB] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E]">
            <Star className="w-4 h-4 fill-[#22C55E]" />
            <span>Reward Points Balance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-mono tabular-nums mt-1">
            {user.reward_points.toLocaleString()} Points
          </h2>
          <p className="text-xs text-white/75 mt-1 max-w-md font-medium">
            Points are earned from saving transfers, bill payments, and completing challenges.
            Points are separate from XP and can be redeemed for real perks!
          </p>
        </div>

        <button
          onClick={() => openModal('redeem_rewards')}
          className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#071A3F] font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer relative z-10"
        >
          Redeem Rewards
        </button>
      </div>

      {/* Rewards Catalogue */}
      <div>
        <h3 className="text-base font-extrabold text-[#0B1B3A] mb-3">Rewards Catalogue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r) => {
            const Icon = getRewardIcon(r.category);
            const canAfford = user.reward_points >= r.points_cost;

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 border border-[#E3E9F4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center border border-[#0047AB]/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-[#D97706] font-mono tabular-nums bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
                      {r.points_cost.toLocaleString()} pts
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#0B1B3A] mt-4">{r.title}</h4>
                  <p className="text-xs text-[#5B6B8C] mt-1 leading-snug">{r.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E3E9F4] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0047AB]">{r.value_display}</span>
                  <button
                    onClick={() => openModal('redeem_rewards')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-xs'
                        : 'bg-[#F4F7FC] text-[#5B6B8C]'
                    }`}
                  >
                    {canAfford ? 'Redeem' : 'Need more pts'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemptions Ledger */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm">
          <h3 className="text-base font-extrabold text-[#0B1B3A] mb-3">Redemption History</h3>
          <div className="divide-y divide-[#E3E9F4]">
            {redemptions.map((red) => (
              <div key={red.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#0B1B3A]">{red.reward_title}</p>
                  <p className="text-[#5B6B8C] font-mono mt-0.5">
                    Voucher Code: <span className="font-bold text-[#0047AB]">{red.code}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#EF4444] font-mono">
                    -{red.points_spent.toLocaleString()} pts
                  </p>
                  <p className="text-[10px] text-[#5B6B8C] mt-0.5">
                    {formatDate(red.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
