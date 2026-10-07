import React from 'react';
import { CreditCard, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CardsInfoModal: React.FC = () => {
  const { closeModal, user } = useApp();
  const [showCardNum, setShowCardNum] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E3E9F4] relative">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-extrabold text-[#0B1B3A]">EcoQuest Cards</h3>
        <p className="text-xs text-[#5B6B8C] mt-0.5">Manage your virtual and physical cards</p>

        {/* Card Artwork */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#071A3F] via-[#003A8C] to-[#0047AB] p-5 text-white shadow-lg border border-white/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-[#22C55E]">ECOQUEST</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
              Virtual Debit
            </span>
          </div>

          <div className="my-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-base tracking-widest text-white/90">
                {showCardNum ? '5399 4192 8820 4192' : '•••• •••• •••• 4192'}
              </p>
              <button
                type="button"
                onClick={() => setShowCardNum(!showCardNum)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                {showCardNum ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/60 mt-1 font-mono">EXP: 08/29 · CVV: •••</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tracking-wider">{user.name.toUpperCase()}</span>
            <span className="font-bold text-sm tracking-tighter">Mastercard</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E3E9F4] flex items-center justify-between">
            <span className="text-[#5B6B8C]">Online Payments</span>
            <span className="font-bold text-[#15803D]">Enabled</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E3E9F4] flex items-center justify-between">
            <span className="text-[#5B6B8C]">Daily Card Limit</span>
            <span className="font-bold text-[#0B1B3A]">₦500,000</span>
          </div>
        </div>

        <button
          onClick={closeModal}
          className="mt-5 w-full py-2.5 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
