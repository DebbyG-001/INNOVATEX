'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Laptop,
  PiggyBank,
  Plane,
  Plus,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira, formatShortDate } from '../../lib/formatters';
import { Goal, NIGERIAN_BANKS } from '../../types';

export const GoalsView: React.FC = () => {
  const { goals, savingsPlans, openModal } = useApp();
  const [activeTab, setActiveTab] = useState<'goals' | 'savings_plans'>('goals');

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'education':
        return { icon: GraduationCap, bg: 'bg-[#DCFCE7] text-[#15803D]' };
      case 'device':
        return { icon: Laptop, bg: 'bg-[#EAF1FF] text-[#0047AB]' };
      case 'travel':
        return { icon: Plane, bg: 'bg-[#EAF1FF] text-[#0047AB]' };
      case 'emergency_fund':
        return { icon: Shield, bg: 'bg-[#FEE2E2] text-[#EF4444]' };
      default:
        return { icon: Target, bg: 'bg-[#F3E8FF] text-[#9333EA]' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Goals & Savings Plans</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Automate monthly pacing and track targeted funds across partner banks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('save_money')}
            className="px-4 py-2.5 bg-white border border-[#E3E9F4] hover:bg-[#F4F7FC] text-[#0B1B3A] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PiggyBank className="w-4 h-4 text-[#9333EA]" />
            <span>Save to Pot</span>
          </button>
          <button
            onClick={() => openModal('create_goal')}
            className="px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3E9F4] pb-2">
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'goals'
              ? 'bg-[#0047AB] text-white shadow-xs'
              : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          Target Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('savings_plans')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'savings_plans'
              ? 'bg-[#0047AB] text-white shadow-xs'
              : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          Structured Savings ({savingsPlans.length})
        </button>
      </div>

      {/* Goals Grid */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const { icon: Icon, bg } = getCategoryIcon(goal.category);
            const percent = Math.min(
              100,
              Math.round((goal.current_amount / goal.target_amount) * 100)
            );
            const isCompleted = goal.current_amount >= goal.target_amount;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Bank Tag */}
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#EAF1FF] text-[#0047AB] rounded-md">
                        <Building2 className="w-3 h-3" />
                        <span>{goal.bank || 'Ecobank Nigeria'}</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-md">
                        🎯 Goal
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-extrabold text-[#0B1B3A]">{goal.name}</h3>
                    <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                      <span className="font-extrabold text-[#15803D] text-lg">
                        {formatNaira(goal.current_amount, true)}
                      </span>
                      <span className="text-[#5B6B8C]">
                        Target: {formatNaira(goal.target_amount, true)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="w-full h-2 bg-[#E3E9F4] rounded-full mt-2.5 overflow-hidden"
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

                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#5B6B8C]">
                      <span>{percent}% Saved</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {goal.months}m ({formatShortDate(goal.deadline)})
                      </span>
                    </div>
                  </div>

                  {/* Required Monthly Pacing */}
                  <div className="mt-4 p-3 rounded-2xl bg-[#F4F7FC] border border-[#E3E9F4] text-xs">
                    <span className="text-[#5B6B8C] block text-[10px] uppercase font-bold">
                      Required Monthly Contribution
                    </span>
                    <span className="font-extrabold text-[#0047AB] font-mono text-sm mt-0.5 block">
                      {formatNaira(goal.required_monthly, true)} / month
                    </span>
                  </div>
                </div>

                {/* Deposit Action */}
                <div className="mt-5 pt-3 border-t border-[#E3E9F4]">
                  {isCompleted ? (
                    <div className="py-2 bg-[#DCFCE7] text-[#15803D] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Goal Completed!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal('save_money', { goalId: goal.id })}
                      className="w-full py-2 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PiggyBank className="w-4 h-4" />
                      <span>Deposit via {goal.bank || 'Ecobank Nigeria'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Structured Savings Plans Grid */}
      {activeTab === 'savings_plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsPlans.map((plan) => {
            const percent = Math.min(
              100,
              Math.round((plan.current_amount / plan.target_amount) * 100)
            );

            return (
              <div
                key={plan.id}
                className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#EAF1FF] text-[#0047AB] rounded-md">
                      <Building2 className="w-3 h-3" />
                      <span>{plan.bank}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0B1B3A] mt-4">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                    <span className="font-extrabold text-[#15803D] text-lg">
                      {formatNaira(plan.current_amount, true)}
                    </span>
                    <span className="text-[#5B6B8C]">
                      Target: {formatNaira(plan.target_amount, true)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#E3E9F4] rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#9333EA] to-[#22C55E] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#5B6B8C]">
                    <span>{percent}% Saved</span>
                    <span>{plan.duration_months} Months Duration</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E3E9F4]">
                  <button
                    onClick={() => openModal('save_money')}
                    className="w-full py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Add Deposit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
