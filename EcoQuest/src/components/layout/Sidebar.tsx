import React from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  PieChart,
  Target,
  Trophy,
  Zap,
  Star,
  Users,
  Wallet,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, user, logout } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'ajo', label: 'Ajo Savings', icon: Users },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'utilities', label: 'Utilities', icon: Zap },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    {
      id: 'rewards',
      label: 'Rewards & Points',
      icon: Star,
      badge: '3',
    },
    { id: 'learn', label: 'Financial IQ', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const comingSoonItems: any[] = [];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#071A3F] text-white flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="h-18 px-6 flex items-center border-b border-white/10">
          <Logo variant="light" size="md" />
        </div>

        {/* Navigation list */}
        <nav className="px-3 py-4 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0047AB] text-white shadow-sm font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#22C55E]' : 'text-white/60'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {comingSoonItems.length > 0 && (
            <div className="pt-4 pb-1">
              <div className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Coming Soon
              </div>
              <div className="space-y-0.5">
                {comingSoonItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      aria-disabled="true"
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/35 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-white/30" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-white/5 rounded text-white/40 border border-white/10">
                        Soon
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Motivational Card (NO plant, NO leaf, NO impact meter) */}
      <div className="p-4 border-t border-white/10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0047AB]/50 border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Small steps, big impact</h5>
              <p className="text-[11px] text-white/60 mt-0.5">
                Save today, build your tomorrow.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-white/60">Current Rank</span>
            <span className="font-bold text-[#22C55E] flex items-center gap-1">
              Level {user.level.index} · {user.level.name}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
