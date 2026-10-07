import React from 'react';
import {
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira, getGreeting } from '../../lib/formatters';

export const HeroBanner: React.FC = () => {
  const {
    user,
    totalBalance,
    isBalanceHidden,
    toggleBalanceHidden,
    openModal,
  } = useApp();

  const greeting = getGreeting(user.name.split(' ')[0] || 'Alex');

  // XP progress calculation
  const levelInfo = user.level;
  const currentThreshold = levelInfo.xp_floor;
  const nextThreshold = levelInfo.xp_next;
  const xpInRange = Math.max(0, user.xp - currentThreshold);
  const totalRange = Math.max(1, nextThreshold - currentThreshold);
  const progressPercent = Math.min(100, Math.round((xpInRange / totalRange) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3F] via-[#003A8C] to-[#0047AB] text-white p-6 sm:p-8 shadow-xl border border-white/10">
      {/* Background ambient lighting effects (Abstract geometric glows, NO plants/landscapes) */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0047AB]/40 rounded-full blur-2xl pointer-events-none" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Balance & XP */}
        <div className="flex-1 max-w-2xl">
          {/* Greeting */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {greeting} <span aria-hidden="true">👋</span>
            </h1>
          </div>
          <p className="text-sm text-white/80 mt-1 font-medium">
            Your goals, your money, your journey. Keep going!
          </p>

          {/* Main Card: Balance and Level XP */}
          <div className="mt-5 p-5 sm:p-6 rounded-2xl bg-[#071A3F]/60 backdrop-blur-md border border-white/15 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Total Balance */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                  <span>Total Balance</span>
                  <button
                    onClick={toggleBalanceHidden}
                    className="p-1 rounded-md hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                    aria-label={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                    aria-pressed={isBalanceHidden}
                  >
                    {isBalanceHidden ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums text-white">
                    {isBalanceHidden ? '₦ ••••••••' : formatNaira(totalBalance)}
                  </span>
                  <button
                    onClick={() => openModal('add_funds')}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-[#22C55E]/30 hover:bg-[#22C55E]/40 border border-[#22C55E]/50 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#22C55E]" />
                    <span>Add funds</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#22C55E]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.5% this month</span>
                </div>
              </div>

              {/* Level Shield & XP Bar */}
              <div className="sm:border-l sm:border-white/10 sm:pl-6 flex-1 max-w-sm">
                <div className="flex items-center gap-3">
                  {/* Hexagon Level Badge */}
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#0047AB] to-[#22C55E] rounded-xl shadow-md border border-white/30">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase font-bold text-white/80 leading-none">
                        Level
                      </span>
                      <span className="text-sm font-black text-white leading-none mt-0.5">
                        {levelInfo.index}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white">{levelInfo.name}</span>
                      <span className="text-white/80 font-mono tabular-nums">
                        {user.xp.toLocaleString()} / {nextThreshold.toLocaleString()} XP
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="w-full h-2.5 bg-white/15 rounded-full mt-2 overflow-hidden p-0.5"
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-white/70 mt-2 font-medium">
                  Complete more goals, save consistently and unlock bigger rewards!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Abstract Glass Floating Quote Card (NO character illustration) */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg relative overflow-hidden group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EcoQuest Habit</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
              “Financial freedom is a journey, not a destination.”
            </p>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
              <span className="font-medium">Streak: {user.streak_days} days</span>
              <button
                onClick={() => openModal('save_money')}
                className="font-bold text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Save now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
