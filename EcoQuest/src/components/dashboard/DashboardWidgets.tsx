import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';
import { Flame, Zap, Target, BookOpen, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export const SavingsStreakWidget: React.FC = () => {
  const { user } = useApp();
  return (
    <div className="bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] rounded-2xl p-5 text-white shadow-sm flex items-center justify-between">
      <div>
        <h4 className="font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-white" />
          {user.streak_days}-Day Savings Streak!
        </h4>
        <p className="text-xs text-white/80 mt-1">Keep it up to earn more points!</p>
      </div>
      <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
        🔥 Active
      </div>
    </div>
  );
};

export const UpcomingBillsWidget: React.FC = () => {
  const { bills, openModal, payBill } = useApp();

  const pendingBills = bills.filter((b) => b.status === 'pending').slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[#0B1B3A] flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0047AB]" />
          Upcoming Bills
        </h4>
        <button
          onClick={() => openModal('pay_bills')}
          className="text-xs font-bold text-[#0047AB] hover:text-[#003A8C]"
        >
          Pay a Bill
        </button>
      </div>

      {pendingBills.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#5B6B8C]">
          No upcoming bills yet. Add your first bill to start tracking your payments.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingBills.map((bill) => (
            <BillItem key={bill.id} bill={bill} payBill={payBill} openModal={openModal} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AjoProgressWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <h4 className="font-bold text-[#0B1B3A] flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-[#22C55E]" />
        Ajo Progress
      </h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-[#0B1B3A]">UI/UX Builders</span>
          <span className="font-bold text-[#0B1B3A]">₦35,000 / ₦50,000</span>
        </div>
        <div className="h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
          <div className="h-full bg-[#22C55E] w-[70%]" />
        </div>
        <div className="flex justify-between text-xs text-[#5B6B8C] mt-2">
          <span>7 members</span>
          <span>4 / 10 cycles</span>
        </div>
      </div>
    </div>
  );
};

export const FinancialIQWidget: React.FC = () => {
  const { setActiveTab } = useApp();
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-[#0B1B3A] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#9333EA]" />
          Financial IQ
        </h4>
        <p className="text-xs text-[#5B6B8C] mt-2">
          Level 1 — Money Basics. Earn XP by learning!
        </p>
      </div>
      <button
        onClick={() => setActiveTab('learn')}
        className="mt-4 w-full py-2 bg-[#F3E8FF] text-[#9333EA] text-sm font-bold rounded-xl hover:bg-[#E9D5FF] transition-colors"
      >
        Take Today's Lesson
      </button>
    </div>
  );
};

export const BudgetHealthWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <h4 className="font-bold text-[#0B1B3A] flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[#F59E0B]" />
        Budget Health
      </h4>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-bold text-[#0B1B3A]">Monthly Budget</span>
        <span className="font-bold text-[#0B1B3A]">₦82,000 / ₦100,000</span>
      </div>
      <div className="h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
        <div className="h-full bg-[#F59E0B] w-[82%]" />
      </div>
      <p className="text-xs text-[#5B6B8C] mt-2 text-center font-semibold">
        On Track
      </p>
    </div>
  );
};

const BillItem: React.FC<{ bill: any, payBill: any, openModal: any }> = ({ bill, payBill, openModal }) => {
  const [isPaying, setIsPaying] = React.useState(false);

  const handlePay = async () => {
    setIsPaying(true);
    const res = await payBill(String(bill.id));
    setIsPaying(false);
    if (res.success && res.transaction) {
      openModal('transaction_receipt', res.transaction);
    } else if (!res.success) {
      alert(res.message);
    }
  };

  const dueDate = new Date(bill.due_date);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-center justify-between p-3 bg-[#F4F7FC] rounded-xl">
      <div>
        <p className="text-sm font-bold text-[#0B1B3A]">{bill.title}</p>
        <p className="text-xs text-[#5B6B8C]">
          {diffDays < 0
            ? `Overdue by ${Math.abs(diffDays)} days`
            : diffDays === 0
            ? 'Due today'
            : `Due in ${diffDays} days`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-bold text-[#0B1B3A]">{formatNaira(bill.amount)}</span>
        <button
          onClick={handlePay}
          disabled={isPaying}
          className="text-xs font-bold bg-[#0047AB] text-white px-3 py-1.5 rounded-lg hover:bg-[#003A8C] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPaying ? 'Paying...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};
