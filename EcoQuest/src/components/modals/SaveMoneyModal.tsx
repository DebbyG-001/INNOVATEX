'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Building2, Calendar, PiggyBank, Target, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';
import { NIGERIAN_BANKS, SAVINGS_DURATIONS } from '../../types';

export const SaveMoneyModal: React.FC = () => {
  const { closeModal, accounts, goals, simulateSaveMoney, openModal, modalData } = useApp();
  
  const [sourceAccountId, setSourceAccountId] = useState<number | string>('');
  const selectedAccount = accounts.find((a) => String(a.id) === String(sourceAccountId));

  const initialGoalId = modalData?.goalId || '';
  const [selectedDestination, setSelectedDestination] = useState<string>(
    initialGoalId ? `goal:${initialGoalId}` : 'account:savings'
  );
  const [amountStr, setAmountStr] = useState('10000');
  const [bank, setBank] = useState<string>('Ecobank Nigeria');
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (!amount || amount <= 0) {
      setError('Please enter an amount above ₦0.');
      return;
    }
    if (!selectedAccount) {
      setError('Source account is required.');
      return;
    }
    if (amount > (selectedAccount?.balance || 0)) {
      setError(`Insufficient balance. ${selectedAccount?.name} has ${formatNaira(selectedAccount?.balance || 0)} available.`);
      return;
    }

    let goalId: string | null = null;
    let targetAccountType: 'savings' | 'flex' = 'savings';

    if (selectedDestination.startsWith('goal:')) {
      goalId = selectedDestination.replace('goal:', '');
    } else if (selectedDestination === 'account:flex') {
      targetAccountType = 'flex';
    }

    setIsSubmitting(true);
    try {
      const res = await simulateSaveMoney(sourceAccountId, goalId, targetAccountType, amount, bank);
      if (res.success) {
        closeModal();
        openModal('transaction_receipt', res.transaction);
      } else {
        setError('Failed to process savings transfer.');
      }
    } catch (e) {
      setError('Failed to process savings transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E3E9F4] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0B1B3A]">Save Money</h3>
            <p className="text-xs text-[#5B6B8C]">
              Move funds to savings pot or specific goal with bank routing
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              From Source
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              <option value="">Select an account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {formatNaira(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Select Destination Pot or Goal
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              <optgroup label="General Savings Pots">
                <option value="account:savings">Savings Account (Direct)</option>
                <option value="account:flex">Flex Account (High Yield)</option>
              </optgroup>
              {goals.length > 0 && (
                <optgroup label="Active Goals">
                  {goals.map((g) => (
                    <option key={g.id} value={`goal:${g.id}`}>
                      🎯 {g.name} ({formatNaira(g.current_amount, true)} /{' '}
                      {formatNaira(g.target_amount, true)}) · {g.bank || 'GTBank'}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Requirement 7: Bank Selection in Savings */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Bank Associated with Savings</span>
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              {NIGERIAN_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Savings Duration */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Savings Horizon</span>
            </label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              <optgroup label="Short Term">
                {SAVINGS_DURATIONS.filter((d) => d.group === 'Short Term').map((d) => (
                  <option key={d.months} value={d.months}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Medium Term">
                {SAVINGS_DURATIONS.filter((d) => d.group === 'Medium Term').map((d) => (
                  <option key={d.months} value={d.months}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Long Term">
                {SAVINGS_DURATIONS.filter((d) => d.group === 'Long Term').map((d) => (
                  <option key={d.months} value={d.months}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Amount to Save (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                ₦
              </span>
              <input
                type="number"
                placeholder="10000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
            <p className="text-[11px] text-[#15803D] mt-1.5 font-medium flex items-center gap-1">
              <span>★ Earns XP + Reward Points and advances savings challenges!</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-bold text-[#5B6B8C] hover:bg-[#F4F7FC] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 ${isSubmitting ? 'bg-[#5B6B8C]' : 'bg-[#22C55E] hover:bg-[#16A34A]'} text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer`}
            >
              <span>{isSubmitting ? 'Processing...' : 'Deposit to Savings'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
