import React from 'react';
import {
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Plus,
  Send,
  ShieldCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const AccountsView: React.FC = () => {
  const { accounts, totalBalance, isBalanceHidden, openModal } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Simulated Accounts</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Manage your savings, current, and flex account balances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('add_funds')}
            className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
          <button
            onClick={() => openModal('transfer')}
            className="px-4 py-2 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071A3F] to-[#0047AB] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-white/10">
        <div>
          <p className="text-xs font-semibold text-white/70">Aggregate Balance</p>
          <h3 className="text-3xl font-black font-mono tabular-nums mt-1">
            {isBalanceHidden ? '₦ ••••••••' : formatNaira(totalBalance)}
          </h3>
          <p className="text-xs text-[#22C55E] font-medium mt-1">
            Distributed across 3 simulated accounts
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/80 max-w-sm">
          <ShieldCheck className="w-4 h-4 text-[#22C55E] mb-1 inline mr-1.5" />
          <span>
            Simulated accounts let you test budgeting, goals, and mission rewards safely without real money.
          </span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isCurrent = acc.type === 'current';
          const isSavings = acc.type === 'savings';

          return (
            <div
              key={acc.id}
              className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isSavings
                        ? 'bg-[#FEE2E2] text-[#EF4444]'
                        : isCurrent
                        ? 'bg-[#EAF1FF] text-[#0047AB]'
                        : 'bg-[#F3E8FF] text-[#9333EA]'
                    }`}
                  >
                    {isSavings ? (
                      <PiggyBank className="w-6 h-6" />
                    ) : isCurrent ? (
                      <Wallet className="w-6 h-6" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#5B6B8C]">
                    {acc.account_number}
                  </span>
                </div>

                <div className="mt-5">
                  <h4 className="text-sm font-bold text-[#5B6B8C]">{acc.name}</h4>
                  <p className="text-2xl font-black text-[#0B1B3A] font-mono tabular-nums mt-1">
                    {isBalanceHidden ? '₦ ••••••••' : formatNaira(acc.balance)}
                  </p>
                  <p className="text-[11px] text-[#5B6B8C] mt-1.5">
                    {isSavings
                      ? 'Dedicated pot for automated goals and buffer compound'
                      : isCurrent
                      ? 'Primary operational balance for transfers and bills'
                      : 'High yield flexible liquidity account'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E3E9F4] flex items-center gap-2">
                {isCurrent ? (
                  <>
                    <button
                      onClick={() => openModal('transfer')}
                      className="flex-1 py-2 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Transfer
                    </button>
                    <button
                      onClick={() => openModal('add_funds')}
                      className="flex-1 py-2 bg-[#F4F7FC] hover:bg-[#EAF1FF] text-[#0047AB] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Top Up
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openModal('save_money')}
                      className="flex-1 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Deposit Funds
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
