import React from 'react';
import {
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const AccountCards: React.FC = () => {
  const { accounts, isBalanceHidden, openModal, setActiveTab } = useApp();

  const savingsAcc = accounts.find((a) => a.type === 'savings') || accounts[0];
  const currentAcc = accounts.find((a) => a.type === 'current') || accounts[1];
  const flexAcc = accounts.find((a) => a.type === 'flex') || accounts[2];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Savings Account */}
      <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2]/60 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
            <PiggyBank className="w-5 h-5" />
          </div>
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Active account" />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#5B6B8C]">Savings Account</p>
          <p className="text-xl font-extrabold text-[#0B1B3A] font-mono tabular-nums mt-1">
            {isBalanceHidden ? '₦ ••••••••' : formatNaira(savingsAcc?.balance || 0)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#5B6B8C]">
            <span className="font-mono">{savingsAcc?.account_number || '•••• 4321'}</span>
            <button
              onClick={() => openModal('save_money')}
              className="text-[#0047AB] hover:underline font-semibold cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* 2. Current Account */}
      <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] border border-[#0047AB]/20 flex items-center justify-center text-[#0047AB]">
            <Wallet className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#5B6B8C]" />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#5B6B8C]">Current Account</p>
          <p className="text-xl font-extrabold text-[#0B1B3A] font-mono tabular-nums mt-1">
            {isBalanceHidden ? '₦ ••••••••' : formatNaira(currentAcc?.balance || 0)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#5B6B8C]">
            <span className="font-mono">{currentAcc?.account_number || '•••• 8765'}</span>
            <button
              onClick={() => openModal('transfer')}
              className="text-[#0047AB] hover:underline font-semibold cursor-pointer"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>

      {/* 3. Flex Account */}
      <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] border border-[#9333EA]/20 flex items-center justify-center text-[#9333EA]">
            <Zap className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#5B6B8C]" />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#5B6B8C]">Flex Account</p>
          <p className="text-xl font-extrabold text-[#0B1B3A] font-mono tabular-nums mt-1">
            {isBalanceHidden ? '₦ ••••••••' : formatNaira(flexAcc?.balance || 0)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#5B6B8C]">
            <span className="font-mono">{flexAcc?.account_number || '•••• 1234'}</span>
            <button
              onClick={() => openModal('add_funds')}
              className="text-[#0047AB] hover:underline font-semibold cursor-pointer"
            >
              Top up
            </button>
          </div>
        </div>
      </div>

      {/* 4. My Cards */}
      <div
        onClick={() => openModal('cards_info')}
        className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] border border-[#0047AB]/20 flex items-center justify-center text-[#0047AB] group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#5B6B8C] group-hover:text-[#0047AB] transition-colors" />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#5B6B8C]">My Cards</p>
          <p className="text-lg font-extrabold text-[#0B1B3A] mt-1">
            2 Active Cards
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#5B6B8C]">
            <span className="font-mono">Virtual & Physical</span>
            <span className="text-[#0047AB] font-semibold group-hover:underline">
              Manage →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
