import React from 'react';
import {
  GraduationCap,
  Laptop,
  Plane,
  Plus,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';
import { Goal } from '../../types';

export const GoalsPanel: React.FC = () => {
  const { goals, openModal, setActiveTab } = useApp();

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'education':
        return {
          icon: GraduationCap,
          bg: 'bg-[#DCFCE7] text-[#15803D]',
        };
      case 'device':
        return {
          icon: Laptop,
          bg: 'bg-[#EAF1FF] text-[#0047AB]',
        };
      case 'travel':
        return {
          icon: Plane,
          bg: 'bg-[#EAF1FF] text-[#0047AB]',
        };
      case 'emergency_fund':
        return {
          icon: Shield,
          bg: 'bg-[#FEE2E2] text-[#EF4444]',
        };
      default:
        return {
          icon: Target,
          bg: 'bg-[#F3E8FF] text-[#9333EA]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-sm text-[#0B1B3A]">Goals & Savings</h3>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-xs font-semibold text-[#0047AB] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Goals list */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#5B6B8C]">
              No active goals yet. Create your first goal below!
            </div>
          ) : (
            goals.slice(0, 3).map((goal) => {
              const { icon: Icon, bg } = getCategoryIcon(goal.category);
              const percent = Math.min(
                100,
                Math.round((goal.current_amount / goal.target_amount) * 100)
              );

              return (
                <div
                  key={goal.id}
                  onClick={() => openModal('save_money', { goalId: goal.id })}
                  className="p-3 rounded-xl border border-[#E3E9F4] hover:bg-[#F4F7FC]/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#0B1B3A] group-hover:text-[#0047AB] transition-colors leading-tight">
                          {goal.name}
                        </h4>
                        <p className="text-[11px] font-mono tabular-nums text-[#15803D] font-bold mt-0.5">
                          {formatNaira(goal.current_amount, true)}
                          <span className="text-[#5B6B8C] font-normal">
                            {' '}
                            / {formatNaira(goal.target_amount, true)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full flex items-center gap-1">
                        🎯 Goal
                      </span>
                      <span className="text-xs font-black text-[#0B1B3A] font-mono tabular-nums">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full h-1.5 bg-[#E3E9F4] rounded-full mt-3 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#0047AB] to-[#22C55E] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create New Goal Button */}
      <button
        onClick={() => openModal('create_goal')}
        className="mt-5 w-full py-2.5 px-4 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Goal</span>
      </button>
    </div>
  );
};
