'use client';

import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

export const LandingPage: React.FC = () => {
  const { setActiveTab, login } = useApp();

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#0B1B3A] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E3E9F4] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <Logo size="md" variant="dark" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('login')}
            className="px-4 py-2 text-xs font-bold text-[#0047AB] hover:bg-[#EAF1FF] rounded-xl transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className="px-5 py-2.5 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col items-center text-center">
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FF] border border-[#0047AB]/20 text-[#0047AB] text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Gamified Personal Finance & Budgeting</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#071A3F] tracking-tight max-w-3xl leading-tight">
          Set your goals. Hit your targets. <span className="text-[#0047AB]">Chop better rewards.</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-[#5B6B8C] max-w-2xl leading-relaxed font-medium">
          EcoQuest empowers you to build disciplined savings habits, complete daily challenges,
          and track bank-linked goals with an adaptive behavioral rules engine.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('register')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#071A3F] font-black text-sm rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Account & Start</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-3xl bg-white border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0B1B3A]">
              Behavioral Rules Engine
            </h3>
            <p className="text-xs text-[#5B6B8C] mt-2 leading-relaxed">
              Personalises your journey based on student, salaried, business, or freelance
              cashflow habits—with transparent "Because..." reasoning.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0B1B3A]">
              Missions, XP & Ranks
            </h3>
            <p className="text-xs text-[#5B6B8C] mt-2 leading-relaxed">
              Advance from Starter to Champion Master rank. Earn separate XP for leveling and
              Reward Points redeemable for airtime and vouchers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0B1B3A]">
              Bank-Linked Goals & Pacing
            </h3>
            <p className="text-xs text-[#5B6B8C] mt-2 leading-relaxed">
              Structure flexible savings durations from 1 to 36 months across top Nigerian
              partner banks with automated monthly contribution calculations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E3E9F4] bg-white text-center text-xs text-[#5B6B8C]">
        <p>© 2026 EcoQuest. All rights reserved. Save · Spend · Grow.</p>
      </footer>
    </div>
  );
};
