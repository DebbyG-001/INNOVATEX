import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Receipt,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatNaira } from '../../lib/formatters';
import { Transaction } from '../../types';

export const RecentTransactions: React.FC = () => {
  const { transactions, searchQuery, openModal, setActiveTab } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'credit' && tx.type !== 'credit') return false;
    if (filterType === 'debit' && tx.type !== 'debit') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.subtitle.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTxIcon = (actionType: Transaction['action_type']) => {
    switch (actionType) {
      case 'money_received':
        return {
          icon: ArrowDownLeft,
          bg: 'bg-[#DCFCE7] text-[#15803D]',
        };
      case 'transfer':
        return {
          icon: ArrowUpRight,
          bg: 'bg-[#FEE2E2] text-[#EF4444]',
        };
      case 'airtime':
        return {
          icon: Smartphone,
          bg: 'bg-[#EAF1FF] text-[#0047AB]',
        };
      case 'bill_payment':
        return {
          icon: Receipt,
          bg: 'bg-[#EAF1FF] text-[#0047AB]',
        };
      case 'saving_transfer':
        return {
          icon: PiggyBank,
          bg: 'bg-[#F3E8FF] text-[#9333EA]',
        };
      case 'funding':
      default:
        return {
          icon: Wallet,
          bg: 'bg-[#DCFCE7] text-[#15803D]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm text-[#0B1B3A]">Recent Transactions</h3>
        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-semibold text-[#0047AB] hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] rounded-xl mb-4 w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filterType === 'all'
              ? 'bg-white text-[#0B1B3A] shadow-xs'
              : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('credit')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filterType === 'credit'
              ? 'bg-white text-[#15803D] shadow-xs'
              : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          Money In
        </button>
        <button
          onClick={() => setFilterType('debit')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filterType === 'debit'
              ? 'bg-white text-[#EF4444] shadow-xs'
              : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          Money Out
        </button>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-[#E3E9F4]">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5B6B8C]">
            No transactions found.
          </div>
        ) : (
          filtered.slice(0, 5).map((tx) => {
            const { icon: Icon, bg } = getTxIcon(tx.action_type);
            const isPositive = tx.type === 'credit';

            return (
              <div
                key={tx.id}
                onClick={() => openModal('transaction_receipt', tx)}
                className="py-3 flex items-center justify-between hover:bg-[#F4F7FC]/70 px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B1B3A] group-hover:text-[#0047AB] transition-colors">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-[#5B6B8C] mt-0.5">
                      {tx.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-extrabold font-mono tabular-nums ${
                      isPositive ? 'text-[#15803D]' : 'text-[#EF4444]'
                    }`}
                  >
                    {isPositive ? '+ ' : '- '}
                    {formatNaira(tx.amount)}
                  </p>
                  <p className="text-[10px] text-[#5B6B8C] mt-0.5">
                    {formatDate(tx.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
