import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  RotateCcw,
  Search,
  Sparkles,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar: React.FC = () => {
  const {
    user,
    searchQuery,
    setSearchQuery,
    notificationsCount,
    clearNotifications,
    setActiveTab,
    resetToFreshUser,
    loadDemoPersona,
    logout,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
    <header className="h-18 bg-white border-b border-[#E3E9F4] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Zone 1: Search bar */}
      <div className="flex-1 max-w-md mr-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions, services, or help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-10 pr-4 py-2 text-sm text-[#0B1B3A] placeholder-[#5B6B8C] focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6B8C] hover:text-[#0B1B3A]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 2 & 3: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (notificationsCount > 0) clearNotifications();
            }}
            className="w-10 h-10 rounded-xl bg-[#F4F7FC] border border-[#E3E9F4] flex items-center justify-center text-[#0B1B3A] hover:bg-[#EAF1FF] hover:border-[#0047AB]/30 transition-colors relative cursor-pointer"
            aria-label={`Notifications, ${notificationsCount} unread`}
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E3E9F4] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E9F4]">
                <h4 className="font-semibold text-sm text-[#0B1B3A]">Notifications</h4>
                <span className="text-xs text-[#5B6B8C]">3 recent</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#EAF1FF] border border-[#0047AB]/10">
                  <p className="font-medium text-[#0047AB]">XP Milestone reached!</p>
                  <p className="text-[#5B6B8C] mt-0.5">You're only 750 XP away from Champion Master tier.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F7FC]">
                  <p className="font-medium text-[#0B1B3A]">Goal Contribution Reminder</p>
                  <p className="text-[#5B6B8C] mt-0.5">Laptop Fund monthly deposit of ₦37,500 is due soon.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F7FC]">
                  <p className="font-medium text-[#0B1B3A]">Challenge unlocked</p>
                  <p className="text-[#5B6B8C] mt-0.5">Complete 5 transactions to earn 300 points.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-[#F4F7FC] border border-transparent hover:border-[#E3E9F4] transition-all cursor-pointer"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0047AB] to-[#22C55E] p-0.5 shadow-sm shrink-0">
              <div className="w-full h-full bg-[#071A3F] rounded-[10px] flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0B1B3A] leading-tight">
                {user.name}
              </span>
              <span className="text-[11px] font-medium text-[#5B6B8C] capitalize leading-tight">
                {user.customer_segment_name || 'Student'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#5B6B8C] hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E3E9F4] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#E3E9F4]">
                <p className="text-xs font-bold text-[#0B1B3A]">{user.name}</p>
                <p className="text-[11px] text-[#5B6B8C]">{user.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#EAF1FF] text-[#0047AB] rounded-md">
                    Level {user.level.index} · {user.level.name}
                  </span>
                  <span className="text-[10px] text-[#5B6B8C]">
                    {user.reward_points.toLocaleString()} pts
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#0B1B3A] hover:bg-[#F4F7FC] flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#0047AB]" />
                  <span>My Financial Profile & Rules</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('onboarding');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#0B1B3A] hover:bg-[#F4F7FC] flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#22C55E]" />
                  <span>Take / Retake Onboarding</span>
                </button>
              </div>



              {/* Requirement 4: Logout option */}
              <div className="border-t border-[#E3E9F4] pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-xs text-[#EF4444] font-bold hover:bg-[#FEE2E2]/40 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
