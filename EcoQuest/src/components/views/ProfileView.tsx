import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  History,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/formatters';

export const ProfileView: React.FC = () => {
  const { user, profileHistory, setActiveTab } = useApp();

  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'AJ';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Financial Profile & Engine</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Rules engine determinations and transparent behavioral reasons
          </p>
        </div>

        <button
          onClick={() => setActiveTab('onboarding')}
          className="px-4 py-2.5 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Update My Answers</span>
        </button>
      </div>

      {/* User Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0047AB] to-[#22C55E] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#071A3F] rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg">
              {initials}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0B1B3A]">{user.name}</h3>
            <p className="text-xs text-[#5B6B8C]">
              {user.email} · {user.occupation.replace('_', ' ')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#EAF1FF] text-[#0047AB] rounded-md">
                Level {user.level.index} · {user.level.name}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#FEF3C7] text-[#D97706] rounded-md">
                {user.reward_points.toLocaleString()} Points
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F4F7FC] border border-[#E3E9F4] text-xs text-[#5B6B8C] max-w-xs">
          <span className="font-bold text-[#0B1B3A] block mb-0.5">Rules Engine Version</span>
          Active Version: 2026.1 · Pure algorithmic evaluation
        </div>
      </div>

      {/* 3 Profile Determinations with Detailed Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Segment */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6B8C]">
              Identity Layer
            </span>
            <h4 className="text-base font-black text-[#0B1B3A] mt-1">
              {user.customer_segment_name}
            </h4>
            <p className="text-xs text-[#5B6B8C] mt-1">
              Defines who you are and shapes your baseline mission paths.
            </p>

            <div className="mt-4 pt-4 border-t border-[#E3E9F4]">
              <span className="text-xs font-bold text-[#0047AB]">Because...</span>
              <ul className="mt-2 space-y-2 text-xs text-[#5B6B8C]">
                {user.explanation.customer_segment.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#0047AB] font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Savings Profile */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6B8C]">
              Behavioral Pattern
            </span>
            <h4 className="text-base font-black text-[#0B1B3A] mt-1">
              {user.savings_profile_name}
            </h4>
            <p className="text-xs text-[#5B6B8C] mt-1">
              Prioritized by liquidity need, goals, and digital transactions.
            </p>

            <div className="mt-4 pt-4 border-t border-[#E3E9F4]">
              <span className="text-xs font-bold text-[#22C55E]">Because...</span>
              <ul className="mt-2 space-y-2 text-xs text-[#5B6B8C]">
                {user.explanation.savings_profile.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#22C55E] font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Profile Tier */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6B8C]">
              Personalisation Tier
            </span>
            <h4 className="text-base font-black text-[#0B1B3A] mt-1 capitalize">
              {user.financial_tier} Tier (Score: {user.financial_score}/4)
            </h4>
            <p className="text-xs text-[#5B6B8C] mt-1">
              Used strictly for dashboard personalization, never credit eligibility.
            </p>

            <div className="mt-4 pt-4 border-t border-[#E3E9F4]">
              <span className="text-xs font-bold text-[#0047AB]">Because...</span>
              <ul className="mt-2 space-y-2 text-xs text-[#5B6B8C]">
                {user.explanation.financial_tier.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#0047AB] font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-[#E3E9F4] text-[10px] text-[#5B6B8C] italic">
            This tier only personalises EcoQuest features. It is not an underwriting or banking eligibility decision.
          </p>
        </div>
      </div>

      {/* Profile History Audit Trail */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[#0047AB]" />
          <h3 className="text-base font-extrabold text-[#0B1B3A]">Profile Evolution Trail</h3>
        </div>

        <div className="space-y-3">
          {profileHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#E3E9F4] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <p className="font-bold text-[#0B1B3A]">
                  {item.field_label}: <span className="text-[#0047AB]">{item.new_value}</span>
                </p>
                <p className="text-[11px] text-[#5B6B8C] mt-0.5">
                  Source: <span className="font-semibold capitalize">{item.source}</span> ·{' '}
                  {item.reason[0]}
                </p>
              </div>
              <span className="text-[11px] text-[#5B6B8C] font-mono shrink-0">
                {formatDate(item.created_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
