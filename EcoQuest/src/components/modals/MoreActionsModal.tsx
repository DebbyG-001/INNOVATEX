import React from 'react';
import {
  CreditCard,
  Gift,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MoreActionsModal: React.FC = () => {
  const { closeModal, openModal, setActiveTab, resetToFreshUser, loadDemoPersona } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E3E9F4] relative">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#5B6B8C] hover:bg-[#F4F7FC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-extrabold text-[#0B1B3A]">More Banking Actions</h3>
        <p className="text-xs text-[#5B6B8C] mt-0.5">Explore additional tools & simulated features</p>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              closeModal();
              openModal('add_funds');
            }}
            className="w-full p-3 rounded-2xl border border-[#E3E9F4] hover:bg-[#F4F7FC] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1B3A]">Add Simulated Funds</p>
              <p className="text-[11px] text-[#5B6B8C]">Top up Current or Savings account</p>
            </div>
          </button>

          <button
            onClick={() => {
              closeModal();
              openModal('create_goal');
            }}
            className="w-full p-3 rounded-2xl border border-[#E3E9F4] hover:bg-[#F4F7FC] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1B3A]">Set Savings Goal</p>
              <p className="text-[11px] text-[#5B6B8C]">Create targeted fund with deadlines</p>
            </div>
          </button>

          <button
            onClick={() => {
              closeModal();
              openModal('redeem_rewards');
            }}
            className="w-full p-3 rounded-2xl border border-[#E3E9F4] hover:bg-[#F4F7FC] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1B3A]">Rewards & Perks</p>
              <p className="text-[11px] text-[#5B6B8C]">Redeem points for airtime & vouchers</p>
            </div>
          </button>

          <button
            onClick={() => {
              closeModal();
              setActiveTab('onboarding');
            }}
            className="w-full p-3 rounded-2xl border border-[#E3E9F4] hover:bg-[#F4F7FC] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1B3A]">Personalisation Wizard</p>
              <p className="text-[11px] text-[#5B6B8C]">Explore full 5-step onboarding</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
