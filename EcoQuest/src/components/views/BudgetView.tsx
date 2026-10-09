import React from 'react';
import { Activity, AlertCircle, Plus } from 'lucide-react';
import { formatNaira } from '../../lib/formatters';
import { useApp } from '../../context/AppContext';

export const BudgetView: React.FC = () => {
  const { budgets, openModal } = useApp();

  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalLimit = budgets.reduce((acc, b) => acc + (b.limit_amount || 0), 0);
  const totalPercent = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
  
  const overBudgetCategories = budgets.filter(b => (b.spent || 0) > (b.limit_amount || 0));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Budget Tracker</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Monitor your monthly spending limits and stay on track
          </p>
        </div>
        <button 
          onClick={() => openModal('create_budget')}
          className="px-4 py-2 bg-[#0047AB] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#003A8C] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm">
          <h3 className="text-sm font-bold text-[#0B1B3A] mb-4">Monthly Overview</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#5B6B8C]">Total Spent</span>
            <span className="text-sm font-bold text-[#0B1B3A]">{formatNaira(totalSpent)} / {formatNaira(totalLimit)}</span>
          </div>
          <div className="h-4 bg-[#F4F7FC] rounded-full overflow-hidden mb-6">
            <div className={`h-full ${totalPercent > 90 ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`} style={{ width: `${totalPercent}%` }} />
          </div>

          <h4 className="text-xs font-bold text-[#5B6B8C] uppercase tracking-wider mb-4">Categories</h4>
          {budgets.length === 0 ? (
            <div className="text-center text-xs text-[#5B6B8C] py-4 bg-[#F4F7FC] rounded-xl">
              No budget categories created yet. Click the button above to start tracking.
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B1B3A]">{cat.name}</span>
                    <span className="font-semibold text-[#5B6B8C]">{formatNaira(cat.spent || 0)} / {formatNaira(cat.limit_amount)}</span>
                  </div>
                  <div className="h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${Math.min(100, ((cat.spent || 0) / cat.limit_amount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {overBudgetCategories.length > 0 && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#92400E]">Over Budget Alert</h4>
                  <div className="text-xs text-[#B45309] mt-1 space-y-1">
                    {overBudgetCategories.map(b => (
                      <p key={b.id}>Exceeded <strong>{b.name}</strong> by {formatNaira((b.spent || 0) - b.limit_amount)}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#22C55E]" />
              <h4 className="text-sm font-bold text-[#0B1B3A]">Budget Health</h4>
            </div>
            <p className="text-xs text-[#5B6B8C] mb-4">
              {overBudgetCategories.length === 0 
                ? "Your overall spending is within limits. Keep it up!" 
                : "Some categories have exceeded limits. Adjust your spending to stay healthy."}
            </p>
            {overBudgetCategories.length === 0 && budgets.length > 0 && (
              <div className="w-full bg-[#EAF1FF] text-[#0047AB] text-center py-2 rounded-xl text-xs font-bold">
                +150 XP on completion
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
