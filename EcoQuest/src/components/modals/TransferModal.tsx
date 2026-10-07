import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const TransferModal: React.FC = () => {
  const { closeModal, accounts, simulateTransfer, openModal } = useApp();
  
  const [sourceAccountId, setSourceAccountId] = useState<number | string>('');
  const selectedAccount = accounts.find((a) => String(a.id) === String(sourceAccountId));

  const [recipient, setRecipient] = useState('');
  const [bank, setBank] = useState('Ecobank Nigeria');
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');

  const banks = [
    'Ecobank Nigeria',
    'First Bank of Nigeria',
    'Zenith Bank',
    'GTBank',
    'Access Bank',
    'United Bank for Africa (UBA)',
    'Kuda Bank',
    'Moniepoint',
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (!recipient.trim()) {
      setError('Please enter a recipient name or account number.');
      return;
    }
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

    setIsSubmitting(true);
    try {
      const res = await simulateTransfer(sourceAccountId, recipient, bank, amount);
      if (res.success) {
        closeModal();
        openModal('transaction_receipt', res.transaction);
      } else {
        setError('Transfer failed: Please provide the source account and destination account number.');
      }
    } catch (e: any) {
      setError(e.message || 'Simulated transfer failed.');
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

        <h3 className="text-lg font-extrabold text-[#0B1B3A]">Transfer Money</h3>
        <p className="text-xs text-[#5B6B8C] mt-0.5">
          Simulated bank transfer
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="mt-4 space-y-4">
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
              Select Bank
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            >
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Recipient Name or Account
            </label>
            <input
              type="text"
              placeholder="e.g. Adebayo Tunde or 0123456789"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setError('');
              }}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3.5 py-2.5 text-xs text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                ₦
              </span>
              <input
                type="number"
                placeholder="15000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-[#5B6B8C]">
                Simulated transaction will update balance and advance challenge tasks.
              </p>
              <p className="text-[10px] font-medium text-[#0B1B3A]">
                Available: {formatNaira(selectedAccount?.balance || 0)}
              </p>
            </div>
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
              <span>{isSubmitting ? 'Sending...' : 'Send Money'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
