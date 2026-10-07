import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  PiggyBank,
  Receipt,
  Search,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatNaira } from '../../lib/formatters';
import { Transaction } from '../../types';

export const TransactionsView: React.FC = () => {
  const { transactions, openModal } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'credit' && tx.type !== 'credit') return false;
    if (filterType === 'debit' && tx.type !== 'debit') return false;
    if (search) {
      const q = search.toLowerCase();
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
        return { icon: ArrowDownLeft, bg: 'bg-[#DCFCE7] text-[#15803D]' };
      case 'transfer':
        return { icon: ArrowUpRight, bg: 'bg-[#FEE2E2] text-[#EF4444]' };
      case 'airtime':
        return { icon: Smartphone, bg: 'bg-[#EAF1FF] text-[#0047AB]' };
      case 'bill_payment':
        return { icon: Receipt, bg: 'bg-[#EAF1FF] text-[#0047AB]' };
      case 'saving_transfer':
        return { icon: PiggyBank, bg: 'bg-[#F3E8FF] text-[#9333EA]' };
      case 'funding':
      default:
        return { icon: Wallet, bg: 'bg-[#DCFCE7] text-[#15803D]' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#0B1B3A]">Transaction History</h2>
        <p className="text-xs text-[#5B6B8C] mt-0.5">
          Simulated ledger of incoming, outgoing, and savings transfers
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E9F4] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#0B1B3A] outline-none focus:ring-2 focus:ring-[#0047AB]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-[#0B1B3A] shadow-xs'
                : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('credit')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === 'credit'
                ? 'bg-white text-[#15803D] shadow-xs'
                : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
            }`}
          >
            Credits
          </button>
          <button
            onClick={() => setFilterType('debit')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === 'debit'
                ? 'bg-white text-[#EF4444] shadow-xs'
                : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
            }`}
          >
            Debits
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-3xl border border-[#E3E9F4] divide-y divide-[#E3E9F4] overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5B6B8C]">
            No transactions matching criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const { icon: Icon, bg } = getTxIcon(tx.action_type);
            const isCredit = tx.type === 'credit';

            return (
              <div
                key={tx.id}
                onClick={() => openModal('transaction_receipt', tx)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F4F7FC]/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0B1B3A] group-hover:text-[#0047AB] transition-colors">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-[#5B6B8C] mt-0.5">
                      {tx.subtitle} · Ref: <span className="font-mono">{tx.reference}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs sm:text-sm font-extrabold font-mono tabular-nums ${
                      isCredit ? 'text-[#15803D]' : 'text-[#EF4444]'
                    }`}
                  >
                    {isCredit ? '+ ' : '- '}
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
