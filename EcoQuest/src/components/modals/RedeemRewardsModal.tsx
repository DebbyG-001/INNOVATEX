import React, { useState } from 'react';
import {
  CheckCircle2,
  Gift,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RedeemRewardsModal: React.FC = () => {
  const { closeModal, rewards, user, redeemReward } = useApp();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [redeemedCode, setRedeemedCode] = useState('');

  const handleRedeem = async (rewardId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    const res = await redeemReward(rewardId);
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.redemption) {
        setRedeemedCode(res.redemption.code);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E3E9F4] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-[#E3E9F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Star className="w-5 h-5 fill-[#D97706]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0B1B3A]">Redeem Points</h3>
              <p className="text-xs text-[#5B6B8C]">
                Exchange your hard-earned points for vouchers and airtime
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#5B6B8C]">Available</span>
            <p className="text-base font-black text-[#0047AB] font-mono tabular-nums">
              {user.reward_points.toLocaleString()} pts
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-[#DCFCE7] border border-[#22C55E]/40 text-xs text-[#15803D]">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Redemption Successful!</span>
            </div>
            <p className="mt-1">{successMessage}</p>
            {redeemedCode && (
              <div className="mt-2.5 p-2 bg-white rounded-xl border border-[#22C55E]/30 font-mono text-center font-bold text-sm text-[#0B1B3A]">
                {redeemedCode}
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {errorMessage}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {rewards.map((reward) => {
            const Icon = getRewardIcon(reward.category);
            const canAfford = user.reward_points >= reward.points_cost;

            return (
              <div
                key={reward.id}
                className="p-4 rounded-2xl border border-[#E3E9F4] hover:bg-[#F4F7FC]/70 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center shrink-0 border border-[#0047AB]/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B1B3A]">
                      {reward.title}
                    </h4>
                    <p className="text-[11px] text-[#5B6B8C] mt-0.5 leading-snug">
                      {reward.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-[#0047AB] bg-[#EAF1FF] px-2 py-0.5 rounded-md">
                      {reward.value_display}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-[#D97706] font-mono tabular-nums">
                    {reward.points_cost.toLocaleString()} pts
                  </p>
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford}
                    className={`mt-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-xs'
                        : 'bg-[#E3E9F4] text-[#5B6B8C] cursor-not-allowed'
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
    </div>
  );
};
