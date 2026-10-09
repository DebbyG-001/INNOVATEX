'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../app/actions/api';
import {
  calculateLevel,
  calculateRequiredMonthly,
  determineFinancialTier,
  determineSavingsProfile,
  determineSegment,
  generateFirstMission,
} from '../lib/rulesEngine';
import { executeAtomicTransfer } from '../app/actions/transfer';
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
  Bill,
  Budget,
} from '../types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'reward';
}

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
  toast: ToastMessage | null;
  showToast: (message: string, type?: ToastMessage['type']) => void;

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

  // Bills
  bills: Bill[];
  createBill: (title: string, category: string, amount: number, due_date: string, recurrence: string) => Promise<Bill>;
  payBill: (billId: string) => Promise<{ success: boolean; message: string }>;

  // Budgets
  budgets: Budget[];
  createBudget: (name: string, limit_amount: number, color?: string) => Promise<Budget>;

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

const INITIAL_USER: UserProfile = {
  name: '',
  email: '',
  occupation: '' as any,
  income_stability: '' as any,
  active_accounts_count: 0,
  has_emergency_savings: false,
  monthly_target: 0,
  customer_segment: '' as any,
  customer_segment_name: '',
  financial_tier: '' as any,
  financial_score: 0,
  savings_profile: '' as any,
  savings_profile_name: '',
  digital_usage: '' as any,
  explanation: {
    customer_segment: [],
    savings_profile: [],
    financial_tier: [],
  },
  level: { index: 1, name: 'Starter', code: 'starter', xp: 0, xp_floor: 0, xp_next: 100 },
  xp: 0,
  reward_points: 0,
  has_completed_onboarding: false,
  streak_days: 0,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.substring(1);
      return path || 'landing';
    }
    return 'landing';
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };
  
  const setTabWithUrl = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${tab === 'dashboard' ? 'dashboard' : tab}`);
    }
  };
  
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
        digital_usage: me.digital_usage || 'moderate',
        explanation: me.explanation || INITIAL_USER.explanation,
        has_completed_onboarding: me.has_completed_onboarding,
        level: calculateLevel(0),
        xp: 0,
        reward_points: 0,
        streak_days: 1
      };
      
      const [
        xps, accs, txs, gs, bs, bdgs, sps, achs, ms, rs
      ] = await Promise.all([
          api.getXP().catch(() => null),
          api.getAccounts().catch(() => []),
          api.getTransactions().catch(() => []),
          api.getGoals().catch(() => []),
          api.getBills().catch(() => []),
          api.getBudgets().catch(() => []),
          api.getSavingsPlans().catch(() => []),
          api.getAchievements().catch(() => []),
          api.getMissions().catch(() => []),
          api.getRewards().catch(() => [])
        ]);

        if (xps) {
          updatedUser.xp = xps.xp;
          updatedUser.reward_points = xps.points;
          updatedUser.level = calculateLevel(xps.xp);
          updatedUser.streak_days = xps.streak_days;
        }
        setUser(updatedUser);

        setAccounts(accs);

        setTransactions((txs || []).map((t: any) => ({
           ...t,
           title: t.description || t.action_type,
           subtitle: t.recipient || '',
           timestamp: t.created_at,
           beneficiary: t.recipient
        })));

        setGoals(gs);
        setBills(bs);
        setBudgets(bdgs);
        setSavingsPlans(sps);

        setAchievements((achs || []).map((a: any) => ({
          ...a,
          title: a.name,
          unlocked: a.completed,
          unlocked_at: a.completed_at,
          progress: a.completed ? 1 : 0,
          max_progress: 1
        })));

        setMissions((ms || []).map((m: any) => ({
          ...m,
          template_code: m.code
        })));
        
        setRewards(rs);
        
        return updatedUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      setActiveTab(path || 'dashboard');
    };
    
    window.addEventListener('popstate', handlePopState);

    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const u = await loadUserData();
          setIsAuthenticated(true);
          const currentPath = window.location.pathname.substring(1);
          if (!currentPath || currentPath === 'landing' || currentPath === 'login' || currentPath === 'register') {
            setTabWithUrl(u.has_completed_onboarding ? 'dashboard' : 'onboarding');
          } else {
            setActiveTab(currentPath);
          }
        } catch {
          setIsAuthenticated(false);
          setTabWithUrl('landing');
        }
      } else {
        setIsAuthenticated(false);
        const currentPath = window.location.pathname.substring(1);
        if (currentPath !== 'login' && currentPath !== 'register') {
          setTabWithUrl('landing');
        } else {
          setActiveTab(currentPath);
        }
      }
      setIsAppLoading(false);
    };
    init();
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const createAccount = async (fullName: string, email: string, password?: string, confirmPassword?: string) => {
    const data = await api.register({ name: fullName, email, password, confirm_password: confirmPassword });
    if (data._isAuthError) {
      throw new Error(data.message);
    }
    localStorage.setItem('auth_token', data.access_token);
    document.cookie = `auth_token=${data.access_token}; path=/; max-age=604800; samesite=strict`;
    await loadUserData();
    setIsAuthenticated(true);
    setTabWithUrl('onboarding');
  };

  const login = async (email?: string, password?: string) => {
    const data = await api.login({ email, password });
    if (data._isAuthError) {
      throw new Error(data.message);
    }
    localStorage.setItem('auth_token', data.access_token);
    document.cookie = `auth_token=${data.access_token}; path=/; max-age=604800; samesite=strict`;
    const u = await loadUserData();
    setIsAuthenticated(true);
    setTabWithUrl(u.has_completed_onboarding ? 'dashboard' : 'onboarding');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    api.logout().catch(() => {});
    setIsAuthenticated(false);
    setTabWithUrl('landing');
  };

  const addFunds = async (accountId: number | string, amount: number) => {
    if (amount <= 0) return { transaction: {} as Transaction, success: false };
    const res = await api.addFunds({ account_id: typeof accountId === 'string' ? parseInt(accountId) : accountId, amount });
    await loadUserData();
    return { transaction: res.transaction || res, success: true };
  };

  const simulateTransfer = async (sourceAccountId: number | string, recipient: string, bank: string, amount: number, note?: string) => {
    if (isNaN(amount) || amount <= 0) return { transaction: {} as Transaction, success: false };
    if (amount > 500000) {
      alert("Maximum demo transfer limit exceeded (₦500,000)");
      return { transaction: {} as Transaction, success: false };
    }
    
    const srcAcc = accounts.find((a) => String(a.id) === String(sourceAccountId));
    if (!srcAcc) return { transaction: {} as Transaction, success: false };
    
    if (srcAcc.balance < amount) {
      alert("Insufficient balance.");
      return { transaction: {} as Transaction, success: false };
    }
    
    // Simplistic check for self-transfer, assuming recipient might be matching the user name or account.
    // Real implementation would check the actual recipient account ID if internal.
    if (recipient.toLowerCase() === user.name.toLowerCase()) {
       alert("You cannot transfer to yourself.");
       return { transaction: {} as Transaction, success: false };
    }
    
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
      const transferRes = await executeAtomicTransfer(
        typeof srcAcc.id === 'string' ? parseInt(srcAcc.id) : srcAcc.id,
        typeof targetAccount.id === 'string' ? parseInt(targetAccount.id) : targetAccount.id,
        amount
      );
      res = { transaction: {} as Transaction, success: 'success' in transferRes ? transferRes.success : false };
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

  const createBudget = async (name: string, limit_amount: number, color?: string) => {
    const newBudget = await api.createBudget({ name, limit_amount, color: color || "bg-[#3B82F6]" });
    await loadUserData();
    return newBudget;
  };

  const createBill = async (title: string, category: string, amount: number, due_date: string, recurrence: string) => {
    const newBill = await api.createBill({ title, category, amount, due_date, recurrence });
    await loadUserData();
    return newBill;
  };

  const payBill = async (billId: string) => {
    try {
      const res = await api.payBill(Number(billId));
      await loadUserData();
      
      if (res.first_payment_achievement_unlocked) {
        showToast('Achievement Unlocked! 🏆 First Digital Payment completed. You earned 100 XP!', 'reward');
      } else if (res.xp_awarded && res.xp_awarded > 0) {
        showToast(`XP Earned! ✨ You earned ${res.xp_awarded} XP and ${res.points_awarded} points for paying a bill!`, 'reward');
      }
      
      return { success: true, message: res.message || 'Bill paid successfully', transaction: res.transaction };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to pay bill' };
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
    setTabWithUrl('dashboard');
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
        isAuthenticated, activeTab, setActiveTab: setTabWithUrl, createAccount, login, logout,
        isBalanceHidden, toggleBalanceHidden, toast, showToast, user, profileHistory, submitOnboarding,
        updateProfileAnswers, resetToFreshUser, loadDemoPersona, accounts, totalBalance,
        addFunds, transactions, simulateTransfer, simulateBillPay, simulateAirtime,
        simulateSaveMoney, goals, createGoal, depositToGoal, savingsPlans, createSavingsPlan,
        missions, claimMissionReward, achievements, activeMissionNotice, hasAwardedFirstDigitalPayment,
        rewards, redemptions, redeemReward, activeModal, openModal, closeModal, modalData,
        showLevelUp, dismissLevelUp, searchQuery, setSearchQuery, notificationsCount, clearNotifications,
        bills, createBill, payBill, budgets, createBudget,
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
