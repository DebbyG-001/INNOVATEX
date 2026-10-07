import React, { useState } from 'react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const AirtimeModal: React.FC = () => {
  const { closeModal, accounts, simulateAirtime, openModal } = useApp();
  
  const [sourceAccountId, setSourceAccountId] = useState<number | string>('');
  const selectedAccount = accounts.find((a) => String(a.id) === String(sourceAccountId));

  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('0803 123 4567');
  const [amountStr, setAmountStr] = useState('1000');
  const [error, setError] = useState('');

  const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
  const presets = [500, 1000, 2000, 5000];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (!phone.trim()) {
      setError('Please enter a phone number.');
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
      const res = await simulateAirtime(sourceAccountId, network, phone, amount);
      if (res.success) {
        closeModal();
        openModal('transaction_receipt', res.transaction);
      } else {
        setError('Airtime purchase failed.');
      }
    } catch (e) {
      setError('Airtime purchase failed.');
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

        <h3 className="text-lg font-extrabold text-[#0B1B3A]">Buy Airtime</h3>
        <p className="text-xs text-[#5B6B8C] mt-0.5">
          Simulated instant recharge
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBuy} className="mt-4 space-y-4">
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
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
              Select Telecom Network
            </label>
            <div className="grid grid-cols-4 gap-2">
              {networks.map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setNetwork(net)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    network === net
                      ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                      : 'border-[#E3E9F4] text-[#5B6B8C] hover:bg-[#F4F7FC]'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              placeholder="0803 123 4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
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
                placeholder="1000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmountStr(p.toString())}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#F4F7FC] hover:bg-[#EAF1FF] text-[#0047AB] rounded-lg border border-[#E3E9F4] cursor-pointer"
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
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
              <span>{isSubmitting ? 'Recharging...' : 'Recharge'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
