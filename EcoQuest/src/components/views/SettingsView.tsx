import React from 'react';
import {
  Bell,
  Eye,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    user,
    isBalanceHidden,
    toggleBalanceHidden,
    resetToFreshUser,
    loadDemoPersona,
    setActiveTab,
    logout,
  } = useApp();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-extrabold text-[#0B1B3A]">Settings & Preferences</h2>
        <p className="text-xs text-[#5B6B8C] mt-0.5">
          Manage display preferences, notifications, and simulated environment data
        </p>
      </div>

      {/* Display & Privacy */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#0B1B3A]">Display & Privacy</h3>

        <div className="flex items-center justify-between py-2 border-b border-[#E3E9F4]">
          <div>
            <p className="text-xs font-bold text-[#0B1B3A]">Mask Balances</p>
            <p className="text-[11px] text-[#5B6B8C]">
              Hide monetary figures in public spaces (e.g. ₦ ••••••••)
            </p>
          </div>
          <button
            onClick={toggleBalanceHidden}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isBalanceHidden
                ? 'bg-[#0047AB] text-white'
                : 'bg-[#F4F7FC] text-[#5B6B8C] border border-[#E3E9F4]'
            }`}
          >
            {isBalanceHidden ? 'Hidden' : 'Visible'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-bold text-[#0B1B3A]">Currency Standard</p>
            <p className="text-[11px] text-[#5B6B8C]">
              Nigerian Naira (₦ / NGN), integer kobo precision
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-[#0047AB] bg-[#EAF1FF] px-2.5 py-1 rounded-lg">
            ₦ NGN
          </span>
        </div>
      </div>

      {/* Sandbox & Demo Persona Controls */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#0B1B3A]">Sandbox & Simulation Tools</h3>
        <p className="text-xs text-[#5B6B8C]">
          EcoQuest runs purely in a safe behavioral simulation. Use these buttons to test
          different states and onboarding journeys.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={resetToFreshUser}
            className="p-4 rounded-2xl border border-[#EF4444]/30 bg-[#FEE2E2]/30 hover:bg-[#FEE2E2]/60 text-[#EF4444] text-left transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 mb-2" />
            <p className="text-xs font-bold">Reset to ₦0 New User</p>
            <p className="text-[11px] text-[#EF4444]/80 mt-0.5">
              Clears balances and missions to run the 5-step onboarding wizard
            </p>
          </button>

          <button
            onClick={loadDemoPersona}
            className="p-4 rounded-2xl border border-[#0047AB]/20 bg-[#EAF1FF]/40 hover:bg-[#EAF1FF] text-[#0047AB] text-left transition-colors cursor-pointer"
          >
            <Sparkles className="w-5 h-5 mb-2 text-[#22C55E]" />
            <p className="text-xs font-bold">Load "Joseph Dania" Mockup State</p>
            <p className="text-[11px] text-[#0047AB]/80 mt-0.5">
              Restores the exact mock-up accounts (₦542,680.00), goals, and challenges
            </p>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-8">
        <button
          onClick={logout}
          className="w-full sm:w-auto px-6 py-3 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out of EcoQuest</span>
        </button>
      </div>
    </div>
  );
};
