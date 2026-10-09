import React from 'react';
import { Zap, Wifi, Tv, Droplet, Smartphone, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const UTILITIES = [
  { id: 'power', name: 'Electricity', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'internet', name: 'Internet Data', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'tv', name: 'Cable TV', icon: Tv, color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'water', name: 'Water Board', icon: Droplet, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  { id: 'airtime', name: 'Airtime', icon: Smartphone, color: 'text-green-500', bg: 'bg-green-100' },
];

export const UtilitiesView: React.FC = () => {
  const { openModal } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Utility Bills</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Pay bills, buy airtime, and earn rewards for digital payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {UTILITIES.map((utility) => {
          const Icon = utility.icon;
          return (
            <button
              key={utility.id}
              onClick={() => openModal('pay_bills')}
              className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${utility.bg} ${utility.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[#0B1B3A]">{utility.name}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-[#0047AB] to-[#003A8C] rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">Auto-Pay Coming Soon</h3>
          <p className="text-sm text-white/80">Never miss a bill again. Set up auto-pay and earn double points.</p>
        </div>
        <div className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
          Soon
        </div>
      </div>
    </div>
  );
};
