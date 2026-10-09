import React, { useState } from 'react';
import { Users, Target, CheckCircle2, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

const MOCK_AJO_GROUPS = [
  { id: '1', name: 'UI/UX Builders', target: 50000, current: 35000, members: 7, max: 10, cycle: 'Weekly' },
  { id: '2', name: 'MacBook Fund', target: 1200000, current: 800000, members: 4, max: 5, cycle: 'Monthly' },
  { id: '3', name: 'December Detty', target: 200000, current: 45000, members: 12, max: 20, cycle: 'Monthly' },
];

export const AjoView: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'my_groups' | 'discover'>('my_groups');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Ajo / Group Savings</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Save together with trusted peers and reach goals faster
          </p>
        </div>
        <button className="px-4 py-2 bg-[#0047AB] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#003A8C] transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Ajo</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#F4F7FC] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('my_groups')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'my_groups' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          My Groups
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'discover' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
          }`}
        >
          Discover
        </button>
      </div>

      {activeTab === 'my_groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E3E9F4] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E3E9F4] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0B1B3A]">UI/UX Builders</h3>
                <p className="text-xs text-[#5B6B8C] mt-1">Cycle 4 of 10 • {formatNaira(5000)}/week</p>
              </div>
              <div className="bg-[#EAF1FF] text-[#0047AB] px-3 py-1.5 rounded-lg text-xs font-bold">
                Your Turn: Week 7
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-[#5B6B8C] font-semibold">Total Pool</p>
                <p className="text-2xl font-black text-[#0B1B3A] font-mono mt-1">{formatNaira(50000)}</p>
              </div>
              <div>
                <p className="text-xs text-[#5B6B8C] font-semibold">Current Balance</p>
                <p className="text-2xl font-black text-[#22C55E] font-mono mt-1">{formatNaira(35000)}</p>
              </div>
              <div>
                <p className="text-xs text-[#5B6B8C] font-semibold">Next Contribution</p>
                <p className="text-lg font-bold text-[#EF4444] font-mono mt-1">{formatNaira(5000)}</p>
                <p className="text-[10px] text-[#EF4444] font-semibold">Due in 2 days</p>
              </div>
            </div>

            <button className="w-full py-3 bg-[#0047AB] text-white text-sm font-bold rounded-xl hover:bg-[#003A8C] transition-colors">
              Make Contribution
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3E9F4] p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#0B1B3A] mb-4">Simulated Ledger</h4>
            <div className="space-y-3">
              {[
                { name: 'Joseph Dania', status: 'paid', amount: 5000, date: 'Today' },
                { name: 'Sarah O.', status: 'paid', amount: 5000, date: 'Yesterday' },
                { name: 'Michael T.', status: 'pending', amount: 5000, date: 'Due in 2 days' },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#F4F7FC] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center font-bold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0B1B3A]">{member.name}</p>
                      <p className="text-[10px] text-[#5B6B8C]">{member.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">{formatNaira(member.amount)}</span>
                    {member.status === 'paid' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_AJO_GROUPS.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#F4F7FC] text-[#5B6B8C] rounded-md uppercase tracking-wider">
                  {group.cycle}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0B1B3A]">{group.name}</h4>
              <p className="text-lg font-black text-[#22C55E] font-mono mt-1">
                Target: {formatNaira(group.target)}
              </p>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-[#5B6B8C] font-semibold">{group.members} / {group.max} members</span>
                <button className="text-[#0047AB] font-bold flex items-center hover:underline">
                  Join <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
