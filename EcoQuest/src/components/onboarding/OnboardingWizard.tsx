import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  LogOut,
  PiggyBank,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';
import {
  calculateRequiredMonthly,
  determineFinancialTier,
  determineSavingsProfile,
  determineSegment,
  generateFirstMission,
} from '../../lib/rulesEngine';
import {
  GoalCategory,
  IncomeStability,
  NIGERIAN_BANKS,
  Occupation,
  OnboardingFormValues,
  SAVINGS_DURATIONS,
} from '../../types';
import { Logo } from '../common/Logo';

export const OnboardingWizard: React.FC = () => {
  const { submitOnboarding, setActiveTab, addFunds, simulateSaveMoney, openModal, accounts } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: About you
  const [occupation, setOccupation] = useState<Occupation | ''>('student');
  const [incomeStability, setIncomeStability] = useState<IncomeStability | ''>('variable');

  // Step 2: Your money
  const [monthlyTargetStr, setMonthlyTargetStr] = useState<string>('30000');
  const [activeAccounts, setActiveAccounts] = useState<number>(2);
  const [hasEmergencySavings, setHasEmergencySavings] = useState<boolean | null>(false);

  // Step 3: Your goals
  const [primaryCategory, setPrimaryCategory] = useState<GoalCategory>('education');
  const [customGoalName, setCustomGoalName] = useState<string>('');
  const [targetAmountStr, setTargetAmountStr] = useState<string>('120000');
  const [months, setMonths] = useState<number>(6);
  const [primaryBank, setPrimaryBank] = useState<string>('Ecobank Nigeria');
  const [hasInitialSavings, setHasInitialSavings] = useState<boolean>(false);
  const [initialSavingsStr, setInitialSavingsStr] = useState<string>('');
  const [extraGoals, setExtraGoals] = useState<
    { category: GoalCategory; customName: string; targetAmount: number; months: number }[]
  >([]);

  // Step 5: Post-submit funding state
  const [fundAccount, setFundAccount] = useState<'current' | 'savings'>('current');
  const [fundAmountStr, setFundAmountStr] = useState<string>('');
  const [hasFunded, setHasFunded] = useState<boolean>(false);
  const [fundedAmount, setFundedAmount] = useState<number>(0);
  const [receiptRef, setReceiptRef] = useState<string>('');

  // Inline Validation Errors
  const [error, setError] = useState<string>('');

  // Calculations for live goal preview
  const parsedTarget = parseFloat(targetAmountStr.replace(/,/g, '')) || 0;
  const parsedInitial = hasInitialSavings
    ? parseFloat(initialSavingsStr.replace(/,/g, '')) || 0
    : 0;
  const estimatedMonthly =
    parsedTarget > 0 ? calculateRequiredMonthly(parsedTarget, parsedInitial, months) : 0;

  const currentGoalDisplayName =
    primaryCategory === 'other'
      ? customGoalName || 'Custom Goal'
      : primaryCategory === 'education'
      ? 'University Essentials'
      : primaryCategory === 'emergency_fund'
      ? 'Emergency Fund'
      : primaryCategory === 'device'
      ? 'Laptop Fund'
      : primaryCategory === 'travel'
      ? 'Travel Home'
      : 'Business Reserve';

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation validation
  const validateAndNext = async () => {
    setError('');

    if (step === 1) {
      if (!occupation) {
        setError('Choose what you do');
        return;
      }
      if (!incomeStability) {
        setError('Choose how steady your income is');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const targetVal = parseFloat(monthlyTargetStr.replace(/,/g, ''));
      if (!targetVal || targetVal <= 0) {
        setError('Enter your monthly savings target (must be greater than ₦0)');
        return;
      }
      if (hasEmergencySavings === null) {
        setError('Indicate whether you currently have emergency savings');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (primaryCategory === 'other' && !customGoalName.trim()) {
        setError('Please name your goal');
        return;
      }
      if (parsedTarget <= 0) {
        setError('How much do you need? Enter a target amount above ₦0');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      // Assemble and Submit
      const allGoals = [
        {
          category: primaryCategory,
          custom_label: primaryCategory === 'other' ? customGoalName.trim() : undefined,
          target_amount: parsedTarget,
          months,
          current_amount: parsedInitial,
          bank: primaryBank,
        },
        ...extraGoals.map((eg) => ({
          category: eg.category,
          custom_label: eg.category === 'other' ? eg.customName : undefined,
          target_amount: eg.targetAmount,
          months: eg.months,
          current_amount: 0,
          bank: primaryBank,
        })),
      ];

      const values: OnboardingFormValues = {
        occupation,
        income_stability: incomeStability,
        monthly_target: parseFloat(monthlyTargetStr.replace(/,/g, '')) || 30000,
        active_accounts: activeAccounts,
        has_emergency_savings: hasEmergencySavings,
        goals: allGoals,
      };

      setIsSubmitting(true);
      try {
        await submitOnboarding(values);
        setStep(5);
      } catch (err: any) {
        setError('Failed to save your profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  // Step 5 Add Funds Action
  const handleAddFundsOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmountStr.replace(/,/g, ''));
    if (!amount || amount <= 0) {
      setError('Enter an amount above ₦0');
      return;
    }

    try {
      const targetAcc = accounts.find((a) => a.type === fundAccount) || accounts[0];
      const res = await addFunds(targetAcc?.id || (fundAccount === 'current' ? 'acc-current' : 'acc-savings'), amount);
      if (res.success) {
        setHasFunded(true);
        setFundedAmount(amount);
        setReceiptRef(res.transaction.reference);
        setError('');
      }
    } catch (e: any) {
      setError('Failed to add funds.');
    }
  };

  // Preview rules computation for Step 4 & 5
  const segmentResult = determineSegment(
    (occupation || 'student') as Occupation,
    currentGoalDisplayName
  );
  const tierResult = determineFinancialTier(
    parseFloat(monthlyTargetStr.replace(/,/g, '')) || 30000,
    (incomeStability || 'variable') as IncomeStability,
    activeAccounts
  );
  const savingsProfileResult = determineSavingsProfile(
    (occupation || 'student') as Occupation,
    [{ category: primaryCategory }],
    !!hasEmergencySavings,
    'none'
  );
  const firstMission = generateFirstMission(
    segmentResult.segment,
    savingsProfileResult.profile,
    { name: currentGoalDisplayName, target_amount: parsedTarget, category: primaryCategory }
  );

  const stepsList = [
    { num: 1, title: 'About you', desc: 'Identity & occupation' },
    { num: 2, title: 'Your money', desc: 'Savings target & cashflow' },
    { num: 3, title: 'Your goals', desc: 'Target funds & timeline' },
    { num: 4, title: 'Review', desc: 'Verify before creation' },
    { num: 5, title: 'Your profile', desc: 'Engine results & start' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col">
      {/* Top Mobile/Tablet Header Bar (visible below 1024px) */}
      <div className="lg:hidden bg-[#071A3F] text-white p-4 flex items-center justify-between border-b border-white/10">
        <Logo size="sm" variant="light" />
        <div className="text-right">
          <span className="text-xs font-bold text-[#22C55E]">Step {step} of 5</span>
          <div className="w-24 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* DESKTOP SPLIT SCREEN: Left Brand Panel (1024px and up) */}
        <aside
          className={`hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-[#071A3F] via-[#003A8C] to-[#0047AB] text-white transition-all duration-300 ${
            step === 3 || step === 5 ? 'w-80 shrink-0' : 'w-5/12 max-w-lg shrink-0'
          }`}
        >
          <div>
            <Logo size="lg" variant="light" />

            <div className="mt-10">
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                A few quick questions to set up your start
              </h2>
              <p className="text-xs text-white/70 mt-2 font-medium">
                Personalized banking, missions, and goals tailored to your rhythm.
              </p>
            </div>

            {/* Vertical Step Rail */}
            <div className="mt-8 space-y-4" role="navigation" aria-label="Onboarding steps">
              {stepsList.map((s) => {
                const isDone = s.num < step;
                const isCurrent = s.num === step;
                const isUpcoming = s.num > step;

                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (isDone) setStep(s.num);
                    }}
                    className={`flex items-start gap-3.5 p-2 rounded-xl transition-all ${
                      isDone ? 'cursor-pointer hover:bg-white/5' : ''
                    }`}
                  >
                    {/* Circle icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-[#22C55E] text-[#071A3F]'
                          : isCurrent
                          ? 'border-2 border-[#22C55E] text-white bg-white/10'
                          : 'border border-white/30 text-white/40'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-white'
                            : isDone
                            ? 'text-white/90'
                            : 'text-white/40'
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 text-[11px] text-white/60 font-medium">
            Your answers only personalise EcoQuest. No real money moves.
          </div>
        </aside>

        {/* RIGHT FORM VIEWPORT */}
        <main className="flex-1 p-4 sm:p-8 xl:p-12 flex flex-col justify-between max-w-4xl mx-auto w-full">
          {/* Top helper links */}
          <div className="hidden lg:flex items-center justify-between pb-4 border-b border-[#E3E9F4] text-xs">
            <span className="font-bold text-[#0047AB]">
              Step {step} of 5 · {stepsList[step - 1].title}
            </span>
            <div className="flex items-center gap-4 text-[#5B6B8C]">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Need help?
              </span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-[#0B1B3A] cursor-pointer"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#EF4444] font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <div className="my-6 space-y-6 max-w-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0047AB]">
                  Step 1 of 5
                </span>
                <h2 className="text-2xl font-extrabold text-[#0B1B3A] mt-1">About you</h2>
                <p className="text-xs text-[#5B6B8C] mt-1">
                  Two quick questions to personalise your start.
                </p>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3A] mb-2">
                  What do you do?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'salaried', label: 'Salaried employee' },
                    { id: 'civil_servant', label: 'Civil servant' },
                    { id: 'business_owner', label: 'Business owner' },
                    { id: 'freelancer', label: 'Freelancer' },
                    { id: 'other', label: 'Other' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOccupation(item.id as Occupation)}
                      className={`h-14 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer text-center ${
                        occupation === item.id
                          ? 'border-2 border-[#0047AB] bg-[#EAF1FF] text-[#0047AB] shadow-xs'
                          : 'border-[#E3E9F4] bg-white text-[#0B1B3A] hover:bg-[#F4F7FC]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Income Stability */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3A] mb-2">
                  How steady is your income?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'stable', label: 'Stable' },
                    { id: 'variable', label: 'Variable' },
                    { id: 'irregular', label: 'Irregular' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIncomeStability(item.id as IncomeStability)}
                      className={`h-14 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        incomeStability === item.id
                          ? 'border-2 border-[#0047AB] bg-[#EAF1FF] text-[#0047AB] shadow-xs'
                          : 'border-[#E3E9F4] bg-white text-[#0B1B3A] hover:bg-[#F4F7FC]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: YOUR MONEY */}
          {step === 2 && (
            <div className="my-6 space-y-6 max-w-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0047AB]">
                  Step 2 of 5
                </span>
                <h2 className="text-2xl font-extrabold text-[#0B1B3A] mt-1">Your money</h2>
                <p className="text-xs text-[#5B6B8C] mt-1">
                  You choose every amount. Nothing is preset.
                </p>
              </div>

              {/* Monthly Savings Target */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
                  Monthly savings target (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-[#5B6B8C]">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="30000"
                    value={monthlyTargetStr}
                    onChange={(e) => setMonthlyTargetStr(e.target.value)}
                    className="w-full h-14 bg-white border border-[#E3E9F4] rounded-2xl pl-10 pr-4 text-base font-extrabold font-mono text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
                  />
                </div>
              </div>

              {/* Active Bank Accounts */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3A] mb-2">
                  Bank accounts you actively use
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { val: 1, label: '1 account' },
                    { val: 2, label: '2 accounts' },
                    { val: 3, label: '3 or more' },
                  ].map((acc) => (
                    <button
                      key={acc.val}
                      type="button"
                      onClick={() => setActiveAccounts(acc.val)}
                      className={`h-14 rounded-2xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        activeAccounts === acc.val
                          ? 'border-2 border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                          : 'border-[#E3E9F4] bg-white text-[#0B1B3A] hover:bg-[#F4F7FC]'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Savings */}
              <div>
                <label className="block text-xs font-bold text-[#0B1B3A] mb-2">
                  Do you have emergency savings?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true, label: 'Yes, I have emergency funds' },
                    { val: false, label: 'No, building from scratch' },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setHasEmergencySavings(opt.val)}
                      className={`h-14 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer text-center ${
                        hasEmergencySavings === opt.val
                          ? 'border-2 border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                          : 'border-[#E3E9F4] bg-white text-[#0B1B3A] hover:bg-[#F4F7FC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: YOUR GOALS (DESKTOP 2-COLUMN WITH LIVE PREVIEW) */}
          {step === 3 && (
            <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047AB]">
                    Step 3 of 5
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0B1B3A] mt-1">Your goals</h2>
                  <p className="text-xs text-[#5B6B8C] mt-1">
                    Add your first goal. You can add more later.
                  </p>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
                    What are you saving for?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'emergency_fund', label: 'Emergency fund' },
                      { id: 'education', label: 'Education' },
                      { id: 'device', label: 'Device' },
                      { id: 'travel', label: 'Travel' },
                      { id: 'business', label: 'Business' },
                      { id: 'other', label: 'Other' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPrimaryCategory(c.id as GoalCategory)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          primaryCategory === c.id
                            ? 'border-2 border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                            : 'border-[#E3E9F4] bg-white text-[#0B1B3A] hover:bg-[#F4F7FC]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name for Other */}
                {primaryCategory === 'other' && (
                  <div>
                    <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
                      Name your goal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wedding fund, Master's thesis"
                      value={customGoalName}
                      maxLength={60}
                      onChange={(e) => setCustomGoalName(e.target.value)}
                      className="w-full h-12 bg-white border border-[#E3E9F4] rounded-xl px-3.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
                    />
                  </div>
                )}

                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
                    How much do you need? (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                      ₦
                    </span>
                    <input
                      type="number"
                      placeholder="120000"
                      value={targetAmountStr}
                      onChange={(e) => setTargetAmountStr(e.target.value)}
                      className="w-full h-12 bg-white border border-[#E3E9F4] rounded-xl pl-8 pr-3 text-sm font-extrabold font-mono text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
                    />
                  </div>
                </div>

                {/* Requirement 7: Bank Selection in Goals */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3A] mb-1">
                    Associated Bank
                  </label>
                  <select
                    value={primaryBank}
                    onChange={(e) => setPrimaryBank(e.target.value)}
                    className="w-full h-12 bg-white border border-[#E3E9F4] rounded-xl px-3.5 text-xs font-semibold text-[#0B1B3A] focus:ring-2 focus:ring-[#0047AB] outline-none"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requirement 5: Expanded Savings Durations */}
                <div>
                  <label className="block text-xs font-bold text-[#0B1B3A] mb-1.5">
                    Savings Duration
                  </label>

                  {/* Short Term */}
                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                      Short Term (1 – 6 Months)
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SAVINGS_DURATIONS.filter((d) => d.group === 'Short Term').map((d) => (
                        <button
                          key={d.months}
                          type="button"
                          onClick={() => setMonths(d.months)}
                          className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            months === d.months
                              ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                              : 'border-[#E3E9F4] bg-white text-[#5B6B8C] hover:bg-[#F4F7FC]'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Medium Term */}
                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                      Medium Term (9 – 18 Months)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SAVINGS_DURATIONS.filter((d) => d.group === 'Medium Term').map((d) => (
                        <button
                          key={d.months}
                          type="button"
                          onClick={() => setMonths(d.months)}
                          className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            months === d.months
                              ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                              : 'border-[#E3E9F4] bg-white text-[#5B6B8C] hover:bg-[#F4F7FC]'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Long Term */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block mb-1">
                      Long Term (2 – 3 Years)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SAVINGS_DURATIONS.filter((d) => d.group === 'Long Term').map((d) => (
                        <button
                          key={d.months}
                          type="button"
                          onClick={() => setMonths(d.months)}
                          className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            months === d.months
                              ? 'border-[#0047AB] bg-[#EAF1FF] text-[#0047AB]'
                              : 'border-[#E3E9F4] bg-white text-[#5B6B8C] hover:bg-[#F4F7FC]'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Already Saved Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1B3A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasInitialSavings}
                      onChange={(e) => setHasInitialSavings(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0047AB]"
                    />
                    <span>I've already saved some toward this</span>
                  </label>

                  {hasInitialSavings && (
                    <div className="mt-2 relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5B6B8C]">
                        ₦
                      </span>
                      <input
                        type="number"
                        placeholder="50000"
                        value={initialSavingsStr}
                        onChange={(e) => setInitialSavingsStr(e.target.value)}
                        className="w-full h-11 bg-white border border-[#E3E9F4] rounded-xl pl-8 pr-3 text-xs font-bold font-mono text-[#0B1B3A] outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Goal Preview */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#071A3F] to-[#0047AB] text-white shadow-xl border border-white/20">
                  <div className="flex items-center justify-between text-xs font-bold text-[#22C55E]">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> Live Goal Preview
                    </span>
                    <span className="text-[10px] uppercase font-bold text-white/60">
                      Step 3 Pacing
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mt-4">
                    {currentGoalDisplayName}
                  </h3>

                  <p className="text-xs text-white/75 mt-1 font-mono">
                    {formatNaira(parsedInitial, true)} of {formatNaira(parsedTarget, true)}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          parsedTarget > 0
                            ? Math.min(100, Math.round((parsedInitial / parsedTarget) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  {/* Estimated Monthly */}
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <p className="text-xs text-white/70">Estimated Monthly Saving:</p>
                    <p className="text-2xl font-black text-white font-mono mt-0.5">
                      {parsedTarget > 0 ? formatNaira(estimatedMonthly, true) : '₦0'}
                      <span className="text-xs font-normal text-white/60"> / month</span>
                    </p>
                    <p className="text-[11px] text-white/60 mt-1">
                      Target deadline in {months} months
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047AB]">
                    Step 4 of 5
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0B1B3A] mt-1">
                    Review your answers
                  </h2>
                  <p className="text-xs text-[#5B6B8C] mt-1">
                    Check everything before EcoQuest builds your profile.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="bg-white rounded-2xl p-4 border border-[#E3E9F4] space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E9F4]">
                    <div>
                      <p className="font-bold text-[#0B1B3A]">About You</p>
                      <p className="text-[#5B6B8C] capitalize">
                        {occupation} · {incomeStability} income
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[#0047AB] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E9F4]">
                    <div>
                      <p className="font-bold text-[#0B1B3A]">Your Money</p>
                      <p className="text-[#5B6B8C]">
                        Target: ₦{parseFloat(monthlyTargetStr || '0').toLocaleString()} / month ·{' '}
                        {activeAccounts} accounts
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[#0047AB] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0B1B3A]">First Goal</p>
                      <p className="text-[#5B6B8C]">
                        {currentGoalDisplayName}: {formatNaira(parsedTarget, true)} in {months} months
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="text-[#0047AB] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EAF1FF] border border-[#0047AB]/20 text-xs text-[#0047AB]">
                  <p className="font-bold">Digital Banking Learning Notice</p>
                  <p className="text-[#5B6B8C] mt-0.5 leading-relaxed">
                    We don't ask about digital banking in onboarding. EcoQuest derives your
                    digital banking experience directly from your real activity.
                  </p>
                </div>
              </div>

              {/* What EcoQuest Will Create */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-3xl bg-white border border-[#E3E9F4] shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B6B8C]">
                    What EcoQuest will create
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F4F7FC]">
                      <p className="font-bold text-[#0B1B3A]">3 Profile Layers</p>
                      <p className="text-[#5B6B8C] mt-0.5">
                        {segmentResult.name} · {savingsProfileResult.name} · {tierResult.tier.toUpperCase()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7FC]">
                      <p className="font-bold text-[#0B1B3A]">First Guided Challenge</p>
                      <p className="text-[#5B6B8C] mt-0.5">{firstMission.title}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F7FC]">
                      <p className="font-bold text-[#0B1B3A]">3 Simulated Accounts</p>
                      <p className="text-[#5B6B8C] mt-0.5">
                        Savings, Current, Flex · Starting at ₦0.00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: YOUR PROFILE (RESULT SCREEN) */}
          {step === 5 && (
            <div className="my-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                  Completed
                </span>
                <h2 className="text-2xl font-extrabold text-[#0B1B3A] mt-1">
                  Your EcoQuest Profile
                </h2>
                <p className="text-xs text-[#5B6B8C] mt-1">
                  Here's what our behavioral rules engine selected and why.
                </p>
              </div>

              {/* Starting State Tags Band */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#071A3F] to-[#0047AB] text-white text-xs">
                <span className="font-bold text-[#22C55E]">Starting State:</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-lg">Level: Starter</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-lg">XP: 0</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-lg">Points: 0</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-lg">
                  Balance: {hasFunded ? formatNaira(fundedAmount) : '₦0.00'}
                </span>
              </div>

              {/* 3 Profile Cards with "Because..." Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Customer Segment */}
                <div className="p-4 rounded-2xl bg-white border border-[#E3E9F4] shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#5B6B8C]">
                    Customer Segment
                  </span>
                  <h4 className="text-sm font-extrabold text-[#0B1B3A] mt-1">
                    {segmentResult.name}
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-[#5B6B8C]">
                    {segmentResult.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#0047AB] font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Savings Profile */}
                <div className="p-4 rounded-2xl bg-white border border-[#E3E9F4] shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#5B6B8C]">
                    Savings Profile
                  </span>
                  <h4 className="text-sm font-extrabold text-[#0B1B3A] mt-1">
                    {savingsProfileResult.name}
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-[#5B6B8C]">
                    {savingsProfileResult.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#22C55E] font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Financial Profile Tier */}
                <div className="p-4 rounded-2xl bg-white border border-[#E3E9F4] shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#5B6B8C]">
                    Financial Profile
                  </span>
                  <h4 className="text-sm font-extrabold text-[#0B1B3A] mt-1 capitalize">
                    {tierResult.tier} Tier (Score: {tierResult.score}/4)
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-[#5B6B8C]">
                    {tierResult.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#0047AB] font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 pt-2 border-t border-[#E3E9F4] text-[10px] text-[#5B6B8C] italic">
                    Personalises your experience. It is not a banking eligibility decision.
                  </p>
                </div>
              </div>

              {/* Bottom Row: First Mission & Simulated Funding Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Mission Card */}
                <div className="p-5 rounded-2xl bg-[#EAF1FF] border border-[#0047AB]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0047AB]">
                      <Sparkles className="w-4 h-4 text-[#22C55E]" />
                      <span>Your First Guided Challenge</span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#0B1B3A] mt-2">
                      {firstMission.title}
                    </h3>
                    <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">
                      {firstMission.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#0047AB]/10 flex items-center justify-between text-xs font-bold text-[#0047AB]">
                    <span>Reward: +{firstMission.points_reward} pts</span>
                    <span>+{firstMission.xp_reward} XP</span>
                  </div>
                </div>

                {/* Simulated Funding Card / Replaced In-Place by Receipt */}
                <div className="p-5 rounded-2xl bg-white border border-[#E3E9F4] shadow-sm">
                  {!hasFunded ? (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0B1B3A]">
                        <Wallet className="w-4 h-4 text-[#0047AB]" />
                        <span>Add Simulated Funds</span>
                      </div>
                      <p className="text-xs text-[#5B6B8C] mt-0.5">
                        Test your account with simulated money (₦0 start)
                      </p>

                      <form onSubmit={handleAddFundsOnboarding} className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5B6B8C] mb-1">
                              Account
                            </label>
                            <select
                              value={fundAccount}
                              onChange={(e) => setFundAccount(e.target.value as any)}
                              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#0B1B3A]"
                            >
                              <option value="current">Current (Default)</option>
                              <option value="savings">Savings Account</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5B6B8C] mb-1">
                              Amount (₦)
                            </label>
                            <input
                              type="number"
                              placeholder="50000"
                              value={fundAmountStr}
                              onChange={(e) => setFundAmountStr(e.target.value)}
                              className="w-full bg-[#F4F7FC] border border-[#E3E9F4] rounded-xl px-2.5 py-2 text-xs font-bold text-[#0B1B3A]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab('dashboard')}
                            className="text-xs text-[#5B6B8C] hover:underline cursor-pointer"
                          >
                            Skip for now
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Add Funds
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Receipt in place */}
                      <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#22C55E]/40 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#15803D]">
                            Credit: {formatNaira(fundedAmount)}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded text-[#15803D]">
                            Simulated
                          </span>
                        </div>
                        <p className="text-[11px] text-[#15803D] mt-1 font-mono">
                          Ref: {receiptRef} · Source: Bank Transfer
                        </p>
                      </div>

                      {/* EcoQuest Suggestion Card */}
                      <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E3E9F4] text-xs space-y-2">
                        <p className="font-bold text-[#0B1B3A]">
                          Suggestion: Move funds to your {currentGoalDisplayName} goal
                        </p>
                        <p className="text-[11px] text-[#5B6B8C]">
                          Adding funds earns no XP by itself. Save money into goals to progress!
                        </p>
                        <button
                          onClick={() => {
                            simulateSaveMoney(accounts[0]?.id || '', null, 'savings', Math.min(10000, fundedAmount));
                            setActiveTab('dashboard');
                          }}
                          className="w-full py-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-lg text-xs cursor-pointer"
                        >
                          Save ₦{Math.min(10000, fundedAmount).toLocaleString()} Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTION ROW PINNED AT BOTTOM */}
          <div className="mt-8 pt-4 border-t border-[#E3E9F4] flex items-center justify-between">
            {step > 1 && step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 text-xs font-bold text-[#5B6B8C] hover:bg-[#EAF1FF] hover:text-[#0047AB] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={validateAndNext}
                className="px-6 py-2.5 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : step === 4 ? (
              <button
                type="button"
                onClick={validateAndNext}
                disabled={isSubmitting}
                className={`px-7 py-3 ${isSubmitting ? 'bg-[#5B6B8C]' : 'bg-[#22C55E] hover:bg-[#16A34A]'} text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer`}
              >
                <span>{isSubmitting ? 'Creating...' : 'Create my profile'}</span>
                {!isSubmitting && <Check className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-7 py-3 bg-[#0047AB] hover:bg-[#003A8C] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Go to dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
