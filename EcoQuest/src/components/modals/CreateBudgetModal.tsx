import React, { useState } from 'react';
import { X, PieChart, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateBudgetModal: React.FC = () => {
  const { closeModal, createBudget } = useApp();
  
  const [name, setName] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [color, setColor] = useState('bg-[#3B82F6]');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    { label: 'Blue', value: 'bg-[#3B82F6]' },
    { label: 'Green', value: 'bg-[#10B981]' },
    { label: 'Red', value: 'bg-[#EF4444]' },
    { label: 'Purple', value: 'bg-[#8B5CF6]' },
    { label: 'Orange', value: 'bg-[#F59E0B]' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter a category name');
    const limit = parseFloat(limitStr.replace(/,/g, ''));
    if (!limit || limit <= 0) return setError('Please enter a valid amount');
    
    setIsSubmitting(true);
    try {
      await createBudget(name, limit, color);
      closeModal();
    } catch (err) {
      setError('Failed to create budget');
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

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0B1B3A]">New Budget Category</h3>
            <p className="text-xs text-[#5B6B8C]">Track your spending for a specific category</p>
          </div>
        </div>

        {error && <div className="mb-4 text-xs text-red-500 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Food & Dining"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-1">Monthly Limit (₦)</label>
            <input
              type="number"
              placeholder="50000"
              value={limitStr}
              onChange={(e) => { setLimitStr(e.target.value); setError(''); }}
              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] mb-2">Category Color</label>
            <div className="flex items-center gap-3">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.value} ${color === c.value ? 'ring-2 ring-offset-2 ring-[#0047AB]' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2.5">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-bold text-[#5B6B8C] hover:bg-[#F4F7FC] rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 ${isSubmitting ? 'bg-[#5B6B8C]' : 'bg-[#0047AB] hover:bg-[#003A8C]'} text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5`}
            >
              <span>{isSubmitting ? 'Saving...' : 'Create Category'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
