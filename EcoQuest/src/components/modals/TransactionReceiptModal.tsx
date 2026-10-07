import React from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatNaira } from '../../lib/formatters';
import { Transaction } from '../../types';

export const TransactionReceiptModal: React.FC = () => {
  const { closeModal, modalData } = useApp();
  const tx: Transaction = modalData;

  if (!tx) return null;

  const isCredit = tx.type === 'credit';
  const actionType = tx.action_type || '';
  const title = tx.title || (tx as any).description || actionType;
  const subtitle = tx.subtitle || (tx as any).recipient || '';
  const timestamp = tx.timestamp || (tx as any).created_at;
  
  // Try to find the account from context
  const { accounts } = useApp();
  const txAccountId = (tx as any).account_id;
  const foundAccount = accounts?.find(a => String(a.id) === String(txAccountId));
  const accountType = tx.account_type || foundAccount?.type || 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E3E9F4] relative">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Status */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#15803D]">Transaction Successful</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4F7FC] text-[#5B6B8C] px-2 py-0.5 rounded-full border border-[#E3E9F4]">
              Simulated
            </span>
          </div>

          <h3 className="text-2xl font-black text-[#0B1B3A] font-mono tabular-nums mt-1">
            {isCredit ? '+ ' : '- '}
            {formatNaira(tx.amount)}
          </h3>
          <p className="text-xs text-[#5B6B8C] mt-0.5">{title}</p>
        </div>

        {/* Receipt Line Items */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F4F7FC] border border-[#E3E9F4] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#5B6B8C]">Transaction Type</span>
            <span className="font-bold text-[#0B1B3A] capitalize">
              {actionType.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5B6B8C]">Details</span>
            <span className="font-semibold text-[#0B1B3A] text-right truncate max-w-[180px]">
              {subtitle}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5B6B8C]">Reference ID</span>
            <span className="font-mono font-bold text-[#0047AB]">{tx.reference}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5B6B8C]">Account</span>
            <span className="font-medium text-[#0B1B3A] capitalize">
              {accountType} Account
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5B6B8C]">Date & Time</span>
            <span className="text-[#0B1B3A] text-[11px]">{formatDate(timestamp)}</span>
          </div>
        </div>

        {/* Simulation Guarantee */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-[#5B6B8C] justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>EcoQuest simulated sandbox environment</span>
        </div>

        <button
          onClick={closeModal}
          className="mt-5 w-full py-2.5 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
