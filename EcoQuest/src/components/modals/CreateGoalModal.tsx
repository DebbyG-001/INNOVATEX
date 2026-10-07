'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Building2, Sparkles, Target, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';
import { GoalCategory, NIGERIAN_BANKS, SAVINGS_DURATIONS } from '../../types';

export const CreateGoalModal: React.FC = () => {
  const { closeModal, createGoal } = useApp();

  const [category, setCategory] = useState<GoalCategory>('education');
  const [customName, setCustomName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [months, setMonths] = useState(6);
  const [bank, setBank] = useState<string>('Ecobank Nigeria');
  const [hasInitialSavings, setHasInitialSavings] = useState(false);
  const [initialAmountStr, setInitialAmountStr] = useState('');
  const [error, setError] = useState('');

  const categories: { id: GoalCategory; label: string }[] = [
    { id: 'emergency_fund', label: 'Emergency fund' },
    { id: 'education', label: 'Education' },
    { id: 'device', label: 'Device' },
    { id: 'travel', label: 'Travel' },
    { id: 'business', label: 'Business' },
    { id: 'other', label: 'Other' },
  ];

  const targetAmount = parseFloat(targetAmountStr.replace(/,/g, '')) || 0;
  const initialAmount = hasInitialSavings
    ? parseFloat(initialAmountStr.replace(/,/g, '')) || 0
    : 0;

  const estimatedMonthly =
    targetAmount > 0
      ? Math.ceil(Math.max(0, targetAmount - initialAmount) / Math.max(1, months))
      : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category === 'other' && !customName.trim()) {
      setError('Please name your goal.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Enter a target amount above ₦0.');
      return;
    }

    const defaultNames: Record<GoalCategory, string> = {
      emergency_fund: 'Emergency Cushion',
      education: 'Education Fund',
      device: 'Tech Device',
      travel: 'Travel Holiday',
      business: 'Business Growth',
      other: customName.trim(),
    };

    const finalName = category === 'other' ? customName.trim() : defaultNames[category];

    setIsSubmitting(true);
    try {
      await createGoal(finalName, category, targetAmount, months, initialAmount, bank);
      closeModal();
    } catch (e) {
      setError('Failed to create goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shortTerm = SAVINGS_DURATIONS.filter((d) => d.group === 'Short Term');
  const mediumTerm = SAVINGS_DURATIONS.filter((d) => d.group === 'Medium Term');
  const longTerm = SAVINGS_DURATIONS.filter((d) => d.group === 'Long Term');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E3E9F4] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0B1B3A]">Create New Goal</h3>
            <p className="text-xs text-[#5B6B8C]">
              Structure a targeted savings fund with bank allocation & flexible durations
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category Chips */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
              What are you saving for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setError('');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB] font-bold shadow-xs'
                      : 'border-[#E3E9F4] text-[#5B6B8C] hover:bg-[#F4F7FC]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Name for Other */}
          {category === 'other' && (
            <div>
              <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
                Goal Name
              </label>
              <input
                type="text"
                maxLength={60}
                placeholder="e.g. Wedding Fund or Professional Exam"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3.5 py-2.5 text-xs text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
          )}

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Target Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                ₦
              </span>
              <input
                type="number"
                placeholder="120000"
                value={targetAmountStr}
                onChange={(e) => {
                  setTargetAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
          </div>

          {/* Requirement 7: Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Associated Bank</span>
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              {NIGERIAN_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Requirement 5: Expanded Savings Duration Options */}
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
              Savings Duration
            </label>

            {/* Short Term */}
            <div className="mb-2">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                Short Term (1 – 6 Months)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {shortTerm.map((d) => (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setMonths(d.months)}
                    className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      months === d.months
                        ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                        : 'border-[#E3E9F4] text-[#5B6B8C] hover:bg-[#F4F7FC]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Medium Term */}
            <div className="mb-2">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                Medium Term (9 – 18 Months)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {mediumTerm.map((d) => (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setMonths(d.months)}
                    className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      months === d.months
                        ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                        : 'border-[#E3E9F4] text-[#5B6B8C] hover:bg-[#F4F7FC]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Long Term */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                Long Term (2 – 3 Years)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {longTerm.map((d) => (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setMonths(d.months)}
                    className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      months === d.months
                        ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                        : 'border-[#E3E9F4] text-[#5B6B8C] hover:bg-[#F4F7FC]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current amount toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0B1B3A]">
              <input
                type="checkbox"
                checked={hasInitialSavings}
                onChange={(e) => setHasInitialSavings(e.target.checked)}
                className="w-4 h-4 rounded text-[#0047AB] focus:ring-[#0047AB]"
              />
              <span>I've already saved some toward this (Current Amount)</span>
            </label>

            {hasInitialSavings && (
              <div className="mt-2 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                  ₦
                </span>
                <input
                  type="number"
                  placeholder="20000"
                  value={initialAmountStr}
                  onChange={(e) => setInitialAmountStr(e.target.value)}
                  className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2 text-xs text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
                />
              </div>
            )}
          </div>

          {/* Live Estimate Card */}
          <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#E3E9F4]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5B6B8C] font-medium">Estimated Monthly Required:</span>
              <span className="font-extrabold font-mono tabular-nums text-[#0047AB] text-sm">
                {targetAmount > 0 ? `${formatNaira(estimatedMonthly, true)} / month` : 'Enter amount'}
              </span>
            </div>
            <p className="text-[11px] text-[#5B6B8C] mt-1">
              {targetAmount > 0
                ? `To reach ${formatNaira(targetAmount, true)} in ${months} months via ${bank}.`
                : 'Enter an amount to see your monthly contribution estimate.'}
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
              <span>{isSubmitting ? 'Creating...' : 'Create Goal'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
