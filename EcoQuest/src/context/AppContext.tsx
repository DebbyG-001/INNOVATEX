'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  calculateLevel,
  calculateRequiredMonthly,
  determineFinancialTier,
  determineSavingsProfile,
  determineSegment,
  generateFirstMission,
} from '../lib/rulesEngine';
import {
  Account,
  Achievement,
  Goal,
  GoalCategory,
  LevelInfo,
  Mission,
  OnboardingFormValues,
  ProfileHistoryItem,
  Reward,
  RewardRedemption,
  SavingsPlan,
  Transaction,
  UserAccount,
  UserProfile,
} from '../types';

interface AppContextType {
  // Authentication & Flow
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  createAccount: (fullName: string, email: string, password?: string, confirmPassword?: string) => Promise<void>;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;

  // Display Controls
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;

  // User & Profile
  user: UserProfile;
  profileHistory: ProfileHistoryItem[];
  submitOnboarding: (values: OnboardingFormValues) => Promise<void>;
  updateProfileAnswers: (values: OnboardingFormValues) => Promise<void>;
  resetToFreshUser: () => void;
  loadDemoPersona: () => void;

  // Accounts & Balance
  accounts: Account[];
  totalBalance: number;
  addFunds: (accountId: number | string, amount: number) => Promise<{ transaction: Transaction; success: boolean }>;

  // Transactions
  transactions: Transaction[];
  simulateTransfer: (sourceAccountId: number | string, recipient: string, bank: string, amount: number, note?: string) => Promise<{ transaction: Transaction; success: boolean }>;
  simulateBillPay: (sourceAccountId: number | string, biller: string, customerId: string, amount: number) => Promise<{ transaction: Transaction; success: boolean }>;
  simulateAirtime: (sourceAccountId: number | string, network: string, phone: string, amount: number) => Promise<{ transaction: Transaction; success: boolean }>;
  simulateSaveMoney: (sourceAccountId: number | string, goalId: string | null, targetAccount: 'savings' | 'flex', amount: number, bank?: string) => Promise<{ transaction: Transaction; success: boolean }>;

  // Goals
  goals: Goal[];
  createGoal: (
    name: string,
    category: GoalCategory,
    targetAmount: number,
    months: number,
    initialAmount?: number,
    bank?: string
  ) => Promise<Goal>;
  depositToGoal: (goalId: string, amount: number) => Promise<boolean>;

  // Savings Plans
  savingsPlans: SavingsPlan[];
  createSavingsPlan: (
    name: string,
    targetAmount: number,
    durationMonths: number,
    bank: string
  ) => Promise<SavingsPlan>;

  // Missions & Gamification
  missions: Mission[];
  claimMissionReward: (missionId: string) => Promise<void>;
  achievements: Achievement[];
  activeMissionNotice: { count: number; reason: string } | null;
  hasAwardedFirstDigitalPayment: boolean;

  // Points & Rewards
  rewards: Reward[];
  redemptions: RewardRedemption[];
  redeemReward: (rewardId: string) => Promise<{ success: boolean; message: string; redemption?: RewardRedemption }>;

  // Modals & UI States
  activeModal: string | null;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  modalData: any;
  showLevelUp: LevelInfo | null;
  dismissLevelUp: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-savings',
    type: 'savings',
    name: 'Savings Account',
    balance: 312450.0,
    account_number: '•••• 4321',
  },
  {
    id: 'acc-current',
    type: 'current',
    name: 'Current Account',
    balance: 180230.0,
    account_number: '•••• 8765',
    card_last4: '4192',
  },
  {
    id: 'acc-flex',
    type: 'flex',
    name: 'Flex Account',
    balance: 50000.0,
    account_number: '•••• 1234',
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'credit',
    action_type: 'money_received',
    title: 'Money Received',
    subtitle: 'From Client Deposit',
    amount: 25000,
    timestamp: '2026-10-06T16:12:00',
    status: 'successful',
    is_simulated: true,
    account_type: 'current',
    reference: 'SIM-EQ-984210',
    beneficiary: 'Fictional Transfer Client',
  },
  {
    id: 'tx-2',
    type: 'debit',
    action_type: 'transfer',
    title: 'Transfer',
    subtitle: 'To Adebayo Tunde',
    amount: 15000,
    timestamp: '2026-10-06T14:30:00',
    status: 'successful',
    is_simulated: true,
    account_type: 'current',
    reference: 'SIM-EQ-983199',
    beneficiary: 'Adebayo Tunde',
  },
  {
    id: 'tx-3',
    type: 'debit',
    action_type: 'airtime',
    title: 'Airtime Purchase',
    subtitle: 'MTN 0803 123 4567',
    amount: 1000,
    timestamp: '2026-10-06T14:30:00',
    status: 'successful',
    is_simulated: true,
    account_type: 'current',
    reference: 'SIM-EQ-982845',
    beneficiary: 'MTN Nigeria',
  },
  {
    id: 'tx-4',
    type: 'debit',
    action_type: 'bill_payment',
    title: 'Electricity Bill',
    subtitle: 'Ibedec',
    amount: 15000,
    timestamp: '2026-10-05T11:05:00',
    status: 'successful',
    is_simulated: true,
    account_type: 'current',
    reference: 'SIM-EQ-979102',
    beneficiary: 'Ibadan Disco (IBEDC)',
  },
  {
    id: 'tx-5',
    type: 'credit',
    action_type: 'money_received',
    title: 'Salary Credit',
    subtitle: 'From Campus Enterprise Stipend',
    amount: 120000,
    timestamp: '2026-10-03T09:18:00',
    status: 'successful',
    is_simulated: true,
    account_type: 'current',
    reference: 'SIM-EQ-974221',
    beneficiary: 'Campus Enterprise Payroll',
  },
];

const SEED_GOALS: Goal[] = [
  {
    id: 'goal-1',
    name: 'Laptop Fund',
    category: 'device',
    target_amount: 300000,
    current_amount: 150000,
    deadline: '2027-02-15',
    months: 4,
    required_monthly: 37500,
    priority: 1,
    status: 'active',
    category_color: 'cobalt',
    bank: 'GTBank',
  },
  {
    id: 'goal-2',
    name: 'University Essentials',
    category: 'education',
    target_amount: 100000,
    current_amount: 25000,
    deadline: '2027-01-30',
    months: 3,
    required_monthly: 25000,
    priority: 2,
    status: 'active',
    category_color: 'green',
    bank: 'Access Bank',
  },
  {
    id: 'goal-3',
    name: 'Travel Home',
    category: 'travel',
    target_amount: 80000,
    current_amount: 10000,
    deadline: '2026-12-20',
    months: 2,
    required_monthly: 35000,
    priority: 3,
    status: 'active',
    category_color: 'cobalt',
    bank: 'First Bank',
  },
];

const SEED_SAVINGS_PLANS: SavingsPlan[] = [
  {
    id: 'sp-1',
    name: 'Emergency Cushion',
    target_amount: 200000,
    current_amount: 80000,
    duration_months: 6,
    bank: 'Zenith Bank',
    status: 'active',
    created_at: '2026-09-01T10:00:00',
  },
  {
    id: 'sp-2',
    name: 'High-Yield Flex Buffer',
    target_amount: 150000,
    current_amount: 50000,
    duration_months: 12,
    bank: 'Stanbic IBTC',
    status: 'active',
    created_at: '2026-09-15T12:00:00',
  },
];

const SEED_MISSIONS: Mission[] = [
  {
    id: 'm-1',
    template_code: 'SAVE_MONTHLY_50K',
    title: 'Save ₦50,000 This Month',
    description: 'Keep your financial goals compounding by moving ₦50k into your savings or goals this month.',
    category: 'saving',
    current_progress: 32450,
    target_progress: 50000,
    unit: '₦',
    xp_reward: 350,
    points_reward: 500,
    status: 'active',
  },
  {
    id: 'm-2',
    template_code: 'TRANSACT_5_TIMES',
    title: 'Make 5 Transactions',
    description: 'Use EcoQuest simulated transfers, bills, or airtime to build digital habits.',
    category: 'transaction',
    current_progress: 3,
    target_progress: 5,
    unit: 'txns',
    xp_reward: 200,
    points_reward: 300,
    status: 'active',
  },
  {
    id: 'm-3',
    template_code: 'CARD_USAGE_3X',
    title: 'Use Your Card 3 Times',
    description: 'Execute transactions using your simulated debit card to earn cardholder points.',
    category: 'card',
    current_progress: 1,
    target_progress: 3,
    unit: 'swipes',
    xp_reward: 150,
    points_reward: 200,
    status: 'active',
  },
  {
    id: 'm-4',
    template_code: 'FIRST_DIGITAL_PAYMENT',
    title: 'Make Your First Digital Payment',
    description: 'Pay a utility bill or buy airtime to build verified digital payment experience.',
    category: 'digital',
    current_progress: 0,
    target_progress: 1,
    unit: 'payment',
    xp_reward: 150,
    points_reward: 200,
    status: 'active',
  },
];

const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    code: 'FIRST_TRANSFER',
    title: 'First Transfer',
    description: 'Sent your first transfer through EcoQuest digital banking.',
    icon_name: 'leaf',
    unlocked: true,
    unlocked_at: '2026-09-15',
    progress: 1,
    max_progress: 1,
  },
  {
    id: 'ach-2',
    code: 'BILL_PAYER',
    title: 'Bill Payer',
    description: 'Settled utility and service bills digitally without hassle.',
    icon_name: 'bill',
    unlocked: true,
    unlocked_at: '2026-09-22',
    progress: 1,
    max_progress: 1,
  },
  {
    id: 'ach-3',
    code: 'GOAL_SETTER',
    title: 'Goal Setter',
    description: 'Created and structured your first targeted savings goal.',
    icon_name: 'bolt',
    unlocked: true,
    unlocked_at: '2026-09-10',
    progress: 1,
    max_progress: 1,
  },
  {
    id: 'ach-4',
    code: 'SAVINGS_CHAMPION',
    title: 'Savings Champion',
    description: 'Accumulated over ₦100,000 in dedicated savings accounts.',
    icon_name: 'piggy',
    unlocked: true,
    unlocked_at: '2026-09-28',
    progress: 1,
    max_progress: 1,
  },
  {
    id: 'ach-5',
    code: 'STREAK_MASTER',
    title: 'Streak Master',
    description: 'Maintained consecutive weekly savings activities for 3+ weeks.',
    icon_name: 'flame',
    unlocked: true,
    unlocked_at: '2026-10-01',
    progress: 1,
    max_progress: 1,
  },
  {
    id: 'ach-6',
    code: 'LEVEL_UP',
    title: 'Level Up',
    description: 'Progressed through ranks to achieve Champion status.',
    icon_name: 'crown',
    unlocked: true,
    unlocked_at: '2026-10-02',
    progress: 1,
    max_progress: 1,
  },
];

const SEED_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    title: '₦1,000 Airtime Top-Up',
    description: 'Instant recharge voucher valid for MTN, Airtel, Glo, or 9mobile.',
    points_cost: 800,
    category: 'airtime',
    value_display: '₦1,000',
  },
  {
    id: 'rew-2',
    title: 'Zero Transfer Fees (30 Days)',
    description: 'Waive all simulated processing fees on outward transfers for one month.',
    points_cost: 1200,
    category: 'perk',
    value_display: '30 Days Free',
  },
  {
    id: 'rew-3',
    title: 'EcoQuest Premium Cap',
    description: 'Official EcoQuest merchandise shipped to your verified campus or home address.',
    points_cost: 2000,
    category: 'merch',
    value_display: 'Merch Item',
  },
  {
    id: 'rew-4',
    title: '₦5,000 Supermarket Voucher',
    description: 'Redeemable at Shoprite, Spar, or Prince Ebeano Supermarkets nationwide.',
    points_cost: 3500,
    category: 'voucher',
    value_display: '₦5,000 Voucher',
  },
  {
    id: 'rew-5',
    title: '₦10,000 Tech Gadget Discount',
    description: 'Special discount voucher on certified study devices and accessories.',
    points_cost: 7000,
    category: 'voucher',
    value_display: '₦10,000 Off',
  },
];

const INITIAL_USER: UserProfile = {
  name: 'User',
  email: 'alex@example.com',
  occupation: 'student',
  income_stability: 'variable',
  active_accounts_count: 2,
  has_emergency_savings: false,
  monthly_target: 30000,
  customer_segment: 'student_saver',
  customer_segment_name: 'Student Saver',
  financial_tier: 'essentials',
  financial_score: 2,
  savings_profile: 'money_learner',
  savings_profile_name: 'Money Learner',
  digital_usage: 'moderate',
  explanation: {
    customer_segment: [
      "You're a student building savings habits",
      'Your primary goal is University Essentials',
    ],
    savings_profile: [
      'You selected an education-related goal as a student',
      "You're starting your foundational financial growth journey",
    ],
    financial_tier: [
      'Monthly target: ₦30,000 meets baseline threshold (+1)',
      'Income stability: Variable cash inflow (+0)',
      '2 active bank accounts utilized (+1)',
    ],
  },
  level: calculateLevel(3750),
  xp: 3750,
  reward_points: 2480,
  has_completed_onboarding: true,
  streak_days: 14,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [hasAwardedFirstDigitalPayment, setHasAwardedFirstDigitalPayment] = useState<boolean>(false);

  const [profileHistory, setProfileHistory] = useState<ProfileHistoryItem[]>([]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState<LevelInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationsCount, setNotificationsCount] = useState<number>(3);

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const toggleBalanceHidden = () => setIsBalanceHidden((prev) => !prev);
  const openModal = (modal: string, data?: any) => { setActiveModal(modal); setModalData(data || null); };
  const closeModal = () => { setActiveModal(null); setModalData(null); };
  const dismissLevelUp = () => setShowLevelUp(null);
  const clearNotifications = () => setNotificationsCount(0);
  
  const triggerConfetti = async () => {
    if (typeof window === 'undefined') return;
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#0047AB', '#22C55E', '#F59E0B', '#071A3F'] });
    } catch {}
  };

  const loadUserData = async () => {
    try {
      const me = await api.getMe();
      const updatedUser: UserProfile = {
        name: me.name,
        email: me.email,
        occupation: me.occupation || 'student',
        income_stability: me.income_stability || 'variable',
        active_accounts_count: me.active_accounts_count || 2,
        has_emergency_savings: me.has_emergency_savings || false,
        monthly_target: me.monthly_target || 30000,
        customer_segment: me.customer_segment || 'student_saver',
        customer_segment_name: me.customer_segment_name || 'Student Saver',
        financial_tier: me.financial_tier || 'essentials',
        financial_score: me.financial_score || 2,
        savings_profile: me.savings_profile || 'money_learner',
        savings_profile_name: me.savings_profile_name || 'Money Learner',
        digital_usage: 'moderate',
        explanation: me.explanation || INITIAL_USER.explanation,
        has_completed_onboarding: me.has_completed_onboarding,
        level: calculateLevel(0),
        xp: 0,
        reward_points: 0,
        streak_days: 1
      };
      
      try {
        const xps = await api.getXP();
        updatedUser.xp = xps.xp;
        updatedUser.reward_points = xps.points;
        updatedUser.level = calculateLevel(xps.xp);
        updatedUser.streak_days = xps.streak_days;
      } catch (e) {}
      setUser(updatedUser);

      const accs = await api.getAccounts();
      setAccounts(accs);

      const txs = await api.getTransactions();
      setTransactions(txs.map((t: any) => ({
         ...t,
         title: t.description || t.action_type,
         subtitle: t.recipient || '',
         timestamp: t.created_at,
         beneficiary: t.recipient
      })));

      const gs = await api.getGoals();
      setGoals(gs);

      const sps = await api.getSavingsPlans();
      setSavingsPlans(sps);

      const achs = await api.getAchievements();
      setAchievements(achs.map((a: any) => ({
        ...a,
        title: a.name,
        unlocked: a.completed,
        unlocked_at: a.completed_at,
        progress: a.completed ? 1 : 0,
        max_progress: 1
      })));

      const ms = await api.getMissions();
      setMissions(ms);
      
      const rs = await api.getRewards();
      setRewards(rs);
      
      return updatedUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const u = await loadUserData();
          setIsAuthenticated(true);
          setActiveTab(u.has_completed_onboarding ? 'dashboard' : 'onboarding');
        } catch {
          setIsAuthenticated(false);
          setActiveTab('landing');
        }
      } else {
        setIsAuthenticated(false);
        setActiveTab('landing');
      }
      setIsAppLoading(false);
    };
    init();
  }, []);

  const createAccount = async (fullName: string, email: string, password?: string, confirmPassword?: string) => {
    const data = await api.register({ name: fullName, email, password, confirm_password: confirmPassword });
    localStorage.setItem('auth_token', data.access_token);
    await loadUserData();
    setIsAuthenticated(true);
    setActiveTab('onboarding');
  };

  const login = async (email?: string, password?: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('auth_token', data.access_token);
    const u = await loadUserData();
    setIsAuthenticated(true);
    setActiveTab(u.has_completed_onboarding ? 'dashboard' : 'onboarding');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    api.logout().catch(() => {});
    setIsAuthenticated(false);
    setActiveTab('landing');
  };

  const addFunds = async (accountId: number | string, amount: number) => {
    if (amount <= 0) return { transaction: {} as Transaction, success: false };
    const res = await api.addFunds({ account_id: typeof accountId === 'string' ? parseInt(accountId) : accountId, amount });
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const simulateTransfer = async (sourceAccountId: number | string, recipient: string, bank: string, amount: number, note?: string) => {
    const srcAcc = accounts.find((a) => String(a.id) === String(sourceAccountId));
    if (!srcAcc || srcAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    const res = await api.createTransaction({
      account_id: srcAcc.id,
      type: 'debit',
      action_type: 'transfer',
      amount,
      description: note || 'Transfer',
      recipient: `To ${recipient} (${bank})`
    });
    
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const simulateBillPay = async (sourceAccountId: number | string, biller: string, customerId: string, amount: number) => {
    const srcAcc = accounts.find((a) => String(a.id) === String(sourceAccountId));
    if (!srcAcc || srcAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    const res = await api.createTransaction({
      account_id: srcAcc.id,
      type: 'debit',
      action_type: 'bill_payment',
      amount,
      description: 'Bill Payment',
      recipient: biller
    });
    
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const simulateAirtime = async (sourceAccountId: number | string, network: string, phone: string, amount: number) => {
    const srcAcc = accounts.find((a) => String(a.id) === String(sourceAccountId));
    if (!srcAcc || srcAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    const res = await api.createTransaction({
      account_id: srcAcc.id,
      type: 'debit',
      action_type: 'airtime',
      amount,
      description: 'Airtime Purchase',
      recipient: `${network} ${phone}`
    });
    
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const simulateSaveMoney = async (sourceAccountId: number | string, goalId: string | null, targetAccountType: 'savings' | 'flex', amount: number, bank?: string) => {
    const srcAcc = accounts.find((a) => String(a.id) === String(sourceAccountId));
    if (!srcAcc || srcAcc.balance < amount) return { transaction: {} as Transaction, success: false };

    let res;
    if (goalId) {
      const targetGoal = goals.find((g) => String(g.id) === String(goalId));
      res = await api.createTransaction({
        account_id: srcAcc.id,
        type: 'debit',
        action_type: 'saving_transfer',
        amount,
        description: 'Save Money',
        recipient: `Toward ${targetGoal?.name || 'Goal'}`,
        goal_id: parseInt(goalId, 10)
      });
    } else {
      const targetAccount = accounts.find((a) => a.type === targetAccountType) || accounts[0];
      res = await api.createTransaction({
        account_id: srcAcc.id,
        type: 'debit',
        action_type: 'saving_transfer',
        amount,
        description: 'Save Money',
        recipient: `Moved to ${targetAccount.name}`
      });
      await api.createTransaction({
        account_id: targetAccount.id,
        type: 'credit',
        action_type: 'saving_transfer',
        amount,
        description: 'Save Money',
        recipient: `From ${srcAcc.name}`
      });
    }
    
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const claimMissionReward = async (missionId: string) => {
    try {
      await api.claimMission(missionId);
      await loadUserData();
      triggerConfetti();
    } catch (e) {}
  };

  const createGoal = async (name: string, category: GoalCategory, targetAmount: number, months: number, initialAmount = 0, bank = 'Ecobank Nigeria') => {
    const reqMonthly = calculateRequiredMonthly(targetAmount, initialAmount, months);
    const newGoal = await api.createGoal({
      name,
      category,
      target_amount: targetAmount,
      current_amount: initialAmount,
      duration: months,
      bank,
      required_monthly: reqMonthly
    });
    await loadUserData();
    return newGoal;
  };

  const createSavingsPlan = async (name: string, targetAmount: number, durationMonths: number, bank: string) => {
    const newPlan = await api.createSavingsPlan({
      name,
      target_amount: targetAmount,
      duration_months: durationMonths,
      bank
    });
    await loadUserData();
    return newPlan;
  };

  const depositToGoal = async (goalId: string, amount: number) => {
    try {
      await api.updateGoal(goalId, { amount_to_add: amount });
      await loadUserData();
      return true;
    } catch {
      return false;
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      const res = await api.redeemReward(rewardId);
      await loadUserData();
      return { success: true, message: 'Reward redeemed successfully', redemption: res };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to redeem reward' };
    }
  };

  const submitOnboarding = async (values: OnboardingFormValues) => {
    const goalsForBackend = values.goals.map((g) => ({
      category: g.category,
      custom_name: g.custom_label,
      target_amount: g.target_amount,
      months: g.months,
      bank: g.bank,
      current_amount: g.current_amount || 0.0
    }));

    await api.submitOnboarding({
      occupation: values.occupation,
      income_stability: values.income_stability,
      monthly_target: values.monthly_target,
      active_accounts: values.active_accounts,
      has_emergency_savings: !!values.has_emergency_savings,
      goals: goalsForBackend
    });

    await loadUserData();
    setActiveTab('dashboard');
  };

  const updateProfileAnswers = async (values: OnboardingFormValues) => {
    await submitOnboarding(values);
  };

  const resetToFreshUser = () => { logout(); };
  const loadDemoPersona = () => { };

  const activeMissionsList = missions.filter((m) => m.status === 'active');
  const activeMissionNotice = activeMissionsList.length > 3 ? { count: activeMissionsList.length, reason: 'You have multiple active challenges!' } : null;

  if (isAppLoading) {
    return <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center font-semibold text-[#0B1B3A]">Loading EcoQuest...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, activeTab, setActiveTab, createAccount, login, logout,
        isBalanceHidden, toggleBalanceHidden, user, profileHistory, submitOnboarding,
        updateProfileAnswers, resetToFreshUser, loadDemoPersona, accounts, totalBalance,
        addFunds, transactions, simulateTransfer, simulateBillPay, simulateAirtime,
        simulateSaveMoney, goals, createGoal, depositToGoal, savingsPlans, createSavingsPlan,
        missions, claimMissionReward, achievements, activeMissionNotice, hasAwardedFirstDigitalPayment,
        rewards, redemptions, redeemReward, activeModal, openModal, closeModal, modalData,
        showLevelUp, dismissLevelUp, searchQuery, setSearchQuery, notificationsCount, clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
