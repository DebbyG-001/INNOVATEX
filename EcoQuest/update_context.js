import fs from 'fs';
import path from 'path';

const contextPath = 'src/context/AppContext.tsx';
let content = fs.readFileSync(contextPath, 'utf8');

// Add import api
if (!content.includes('import { api }')) {
  content = content.replace(
    "import {",
    "import { api } from '../lib/api';\nimport {"
  );
}

// Prepare the new provider body
const newProvider = `export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [rewards] = useState<Reward[]>(SEED_REWARDS);
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
      setAchievements(achs);

      const ms = await api.getMissions();
      setMissions(ms);
      
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

  const createAccount = async (fullName: string, email: string, password?: string) => {
    const data = await api.register({ name: fullName, email, password });
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

  const addFunds = async (accountId: string, amount: number) => {
    if (amount <= 0) return { transaction: {} as Transaction, success: false };
    const res = await api.addFunds({ account_id: accountId, amount });
    await loadUserData();
    return { transaction: res.transaction, success: true };
  };

  const simulateTransfer = async (recipient: string, bank: string, amount: number, note?: string) => {
    const currentAcc = accounts.find((a) => a.type === 'current') || accounts[0];
    if (currentAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    await api.createTransaction({
      account_id: currentAcc.id,
      type: 'debit',
      action_type: 'transfer',
      amount,
      description: note || 'Transfer',
      recipient: \`To \${recipient} (\${bank})\`
    });
    
    await loadUserData();
    return { transaction: {} as Transaction, success: true };
  };

  const simulateBillPay = async (biller: string, customerId: string, amount: number) => {
    const currentAcc = accounts.find((a) => a.type === 'current') || accounts[0];
    if (currentAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    await api.createTransaction({
      account_id: currentAcc.id,
      type: 'debit',
      action_type: 'bill_payment',
      amount,
      description: 'Bill Payment',
      recipient: biller
    });
    
    await loadUserData();
    return { transaction: {} as Transaction, success: true };
  };

  const simulateAirtime = async (network: string, phone: string, amount: number) => {
    const currentAcc = accounts.find((a) => a.type === 'current') || accounts[0];
    if (currentAcc.balance < amount) return { transaction: {} as Transaction, success: false };
    
    await api.createTransaction({
      account_id: currentAcc.id,
      type: 'debit',
      action_type: 'airtime',
      amount,
      description: 'Airtime Purchase',
      recipient: \`\${network} \${phone}\`
    });
    
    await loadUserData();
    return { transaction: {} as Transaction, success: true };
  };

  const simulateSaveMoney = async (goalId: string | null, targetAccountType: 'savings' | 'flex', amount: number, bank?: string) => {
    const currentAcc = accounts.find((a) => a.type === 'current') || accounts[0];
    if (currentAcc.balance < amount) return { transaction: {} as Transaction, success: false };

    if (goalId) {
      await api.updateGoal(goalId, { amount_to_add: amount });
    } else {
      const targetAccount = accounts.find((a) => a.type === targetAccountType) || accounts[0];
      await api.createTransaction({
        account_id: currentAcc.id,
        type: 'debit',
        action_type: 'saving_transfer',
        amount,
        description: 'Save Money',
        recipient: \`Moved to \${targetAccount.name}\`
      });
      await api.createTransaction({
        account_id: targetAccount.id,
        type: 'credit',
        action_type: 'saving_transfer',
        amount,
        description: 'Save Money',
        recipient: \`From \${currentAcc.name}\`
      });
    }
    
    await loadUserData();
    return { transaction: {} as Transaction, success: true };
  };

  const claimMissionReward = async (missionId: string) => {
    try {
      await api.claimMission(missionId);
      await loadUserData();
      triggerConfetti();
    } catch (e) {}
  };

  const createGoal = async (name: string, category: GoalCategory, targetAmount: number, months: number, initialAmount = 0, bank = 'GTBank') => {
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

  const redeemReward = (rewardId: string) => {
    return { success: false, message: 'Not implemented on backend yet.' };
  };

  const submitOnboarding = async (values: OnboardingFormValues) => {
    const primaryGoalInput = values.goals[0];
    const goalsForProfile = values.goals.map((g) => ({
      category: g.category as GoalCategory,
      name: g.custom_label || g.category,
      target_amount: g.target_amount,
      months: g.months,
      bank: g.bank
    }));

    await api.submitOnboarding({
      occupation: values.occupation,
      income_stability: values.income_stability,
      monthly_target: values.monthly_target,
      active_accounts: values.active_accounts,
      has_emergency_savings: !!values.has_emergency_savings,
      primary_account: 'current',
      savings_preferences: { goals: goalsForProfile }
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
`;

const startIndex = content.indexOf('export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {');
const endIndex = content.indexOf('export const useApp = () => {');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newProvider + '\n' + content.slice(endIndex);
  fs.writeFileSync(contextPath, content, 'utf8');
  console.log('Successfully updated AppContext.tsx');
} else {
  console.error('Could not find start or end index');
}
