import React from 'react';
import {
  MoreHorizontal,
  PiggyBank,
  PlusCircle,
  Receipt,
  Send,
  Smartphone,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickActions: React.FC = () => {
  const { openModal } = useApp();

  const actions = [
    {
      id: 'transfer',
      label: 'Transfer Money',
      icon: Send,
      color: 'bg-[#EAF1FF] text-[#0047AB] border-[#0047AB]/20',
      onClick: () => openModal('transfer'),
    },
    {
      id: 'bills',
      label: 'Pay Bills',
      icon: Receipt,
      color: 'bg-[#EAF1FF] text-[#0047AB] border-[#0047AB]/20',
      onClick: () => openModal('pay_bills'),
    },
    {
      id: 'airtime',
      label: 'Buy Airtime',
      icon: Smartphone,
      color: 'bg-[#EAF1FF] text-[#0047AB] border-[#0047AB]/20',
      onClick: () => openModal('buy_airtime'),
    },
    {
      id: 'save',
      label: 'Save Money',
      icon: PiggyBank,
      color: 'bg-[#F3E8FF] text-[#9333EA] border-[#9333EA]/20',
      onClick: () => openModal('save_money'),
    },
    {
      id: 'goal',
      label: 'Set Goal',
      icon: Target,
      color: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]/20',
      onClick: () => openModal('create_goal'),
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      color: 'bg-[#F4F7FC] text-[#5B6B8C] border-[#E3E9F4]',
      onClick: () => openModal('more_actions'),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-[#F4F7FC] transition-all group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${act.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#0B1B3A] mt-2.5 text-center leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
