import React from 'react';
import {
  ArrowLeftRight,
  Crown,
  Flame,
  PiggyBank,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AchievementsGrid: React.FC = () => {
  const { achievements, setActiveTab } = useApp();

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'FIRST_TRANSFER':
        return {
          icon: ArrowLeftRight,
          bg: 'from-[#22C55E] to-[#15803D]',
          border: 'border-[#22C55E]/40',
          textColor: 'text-white',
        };
      case 'BILL_PAYER':
        return {
          icon: Receipt,
          bg: 'from-[#0047AB] to-[#003A8C]',
          border: 'border-[#0047AB]/40',
          textColor: 'text-white',
        };
      case 'GOAL_SETTER':
        return {
          icon: Zap,
          bg: 'from-[#9333EA] to-[#7E22CE]',
          border: 'border-[#9333EA]/40',
          textColor: 'text-white',
        };
      case 'SAVINGS_CHAMPION':
        return {
          icon: PiggyBank,
          bg: 'from-[#F59E0B] to-[#D97706]',
          border: 'border-[#F59E0B]/40',
          textColor: 'text-white',
        };
      case 'STREAK_MASTER':
        return {
          icon: Flame,
          bg: 'from-[#EF4444] to-[#B91C1C]',
          border: 'border-[#EF4444]/40',
          textColor: 'text-white',
        };
      case 'LEVEL_UP':
      default:
        return {
          icon: Crown,
          bg: 'from-[#EAB308] to-[#CA8A04]',
          border: 'border-[#EAB308]/40',
          textColor: 'text-white',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm text-[#0B1B3A]">Achievements</h3>
        <button
          onClick={() => setActiveTab('achievements')}
          className="text-xs font-semibold text-[#0047AB] hover:underline cursor-pointer"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.slice(0, 6).map((ach) => {
          const style = getBadgeIcon(ach.code);
          const Icon = style.icon;

          return (
            <div
              key={ach.id}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-[#F4F7FC] transition-colors group cursor-default"
              title={`${ach.title}: ${ach.description}`}
            >
              {/* Hexagonal Shield Container */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${style.bg} ${style.border} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                  ach.unlocked ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
              >
                <Icon className={`w-6 h-6 ${style.textColor}`} />
              </div>

              <span className="text-[11px] font-bold text-[#0B1B3A] mt-2 text-center leading-tight">
                {ach.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
