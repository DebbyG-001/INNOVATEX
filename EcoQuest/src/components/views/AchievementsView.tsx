import React from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  PiggyBank,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AchievementsView: React.FC = () => {
  const { achievements, user } = useApp();

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'FIRST_TRANSFER':
        return { icon: ArrowLeftRight, bg: 'from-[#22C55E] to-[#15803D]' };
      case 'BILL_PAYER':
        return { icon: Receipt, bg: 'from-[#0047AB] to-[#003A8C]' };
      case 'GOAL_SETTER':
        return { icon: Zap, bg: 'from-[#9333EA] to-[#7E22CE]' };
      case 'SAVINGS_CHAMPION':
        return { icon: PiggyBank, bg: 'from-[#F59E0B] to-[#D97706]' };
      case 'STREAK_MASTER':
        return { icon: Flame, bg: 'from-[#EF4444] to-[#B91C1C]' };
      case 'LEVEL_UP':
      default:
        return { icon: Crown, bg: 'from-[#EAB308] to-[#CA8A04]' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#0B1B3A]">Achievements & Badges</h2>
        <p className="text-xs text-[#5B6B8C] mt-0.5">
          Milestone badges unlocked through disciplined budgeting and consistency
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach) => {
          const style = getBadgeIcon(ach.code);
          const Icon = style.icon;

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
                ach.unlocked
                  ? 'border-[#E3E9F4] hover:shadow-md'
                  : 'border-[#E3E9F4]/70 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${style.bg} flex items-center justify-center shadow-md text-white ${
                      ach.unlocked ? '' : 'grayscale'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#5B6B8C] bg-[#F4F7FC] px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-[#0B1B3A] mt-4">{ach.title}</h3>
                <p className="text-xs text-[#5B6B8C] mt-1 leading-snug">{ach.description}</p>
              </div>

              {ach.unlocked && ach.unlocked_at && (
                <p className="text-[11px] font-mono text-[#5B6B8C] mt-5 pt-3 border-t border-[#E3E9F4]">
                  Earned on {ach.unlocked_at}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
