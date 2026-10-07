import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, Wallet, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const AddFundsModal: React.FC = () => {
  const { closeModal, accounts, addFunds, openModal } = useApp();

  const [accountId, setAccountId] = useState(accounts[1]?.id || accounts[0]?.id);
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (!amount || amount <= 0) {
      setError('Enter an amount above ₦0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addFunds(accountId, amount);
      if (res.success) {
        closeModal();
        openModal('transaction_receipt', res.transaction);
      } else {
        setError('Failed to add simulated funds.');
      }
    } catch (e) {
      setError('Failed to add simulated funds.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E3E9F4] relative">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0B1B3A]">Add Simulated Funds</h3>
            <p className="text-xs text-[#5B6B8C]">
              Credit simulated money to test banking features
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddFunds} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Select Receiving Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatNaira(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Amount to Add (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                ₦
              </span>
              <input
                type="number"
                placeholder="50000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
          </div>

          {/* Funding Rule Disclaimer from specification */}
          <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E3E9F4] text-[11px] text-[#5B6B8C] leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#0B1B3A] mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Simulated Funding Policy</span>
            </div>
            Adding funds updates your balance, but is not counted as savings behavior
            and awards no XP or points by itself. Savings challenges advance through Save Money transfers.
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
              className={`px-5 py-2.5 ${isSubmitting ? 'bg-[#5B6B8C]' : 'bg-[#0047AB] hover:bg-[#003A8C]'} text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer`}
            >
              <span>{isSubmitting ? 'Adding...' : 'Add Funds'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
