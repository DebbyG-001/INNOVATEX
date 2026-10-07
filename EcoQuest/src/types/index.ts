export type Occupation =
  | 'student'
  | 'salaried'
  | 'civil_servant'
  | 'business_owner'
  | 'freelancer'
  | 'other';

export type IncomeStability = 'stable' | 'variable' | 'irregular';

export type DigitalUsage = 'none' | 'low' | 'moderate' | 'high';

export type CustomerSegment =
  | 'student_saver'
  | 'salary_earner'
  | 'business_builder'
  | 'independent_earner'
  | 'flexible_saver';

export type FinancialTier = 'essentials' | 'plus' | 'prime';

export type SavingsProfile =
  | 'money_learner'
  | 'buffer_builder'
  | 'digital_starter'
  | 'streak_saver';

export type GoalCategory =
  | 'emergency_fund'
  | 'education'
  | 'device'
  | 'travel'
  | 'business'
  | 'other';

export type LevelName = 'starter' | 'builder' | 'achiever' | 'champion' | 'master';

export const NIGERIAN_BANKS = [
  'Ecobank Nigeria',
  'Access Bank',
  'GTBank',
  'First Bank',
  'UBA',
  'Zenith Bank',
  'Stanbic IBTC',
  'Fidelity Bank',
  'Sterling Bank',
  'FCMB',
  'Wema Bank',
] as const;

export type NigerianBank = (typeof NIGERIAN_BANKS)[number];

export interface SavingsDurationOption {
  months: number;
  label: string;
  group: 'Short Term' | 'Medium Term' | 'Long Term';
}

export const SAVINGS_DURATIONS: SavingsDurationOption[] = [
  { months: 1, label: '1 month', group: 'Short Term' },
  { months: 2, label: '2 months', group: 'Short Term' },
  { months: 3, label: '3 months', group: 'Short Term' },
  { months: 4, label: '4 months', group: 'Short Term' },
  { months: 6, label: '6 months', group: 'Short Term' },
  { months: 9, label: '9 months', group: 'Medium Term' },
  { months: 12, label: '12 months', group: 'Medium Term' },
  { months: 18, label: '18 months', group: 'Medium Term' },
  { months: 24, label: '24 months', group: 'Long Term' },
  { months: 36, label: '36 months', group: 'Long Term' },
];

export interface LevelInfo {
  index: number;
  name: string;
  code: LevelName;
  xp: number;
  xp_floor: number;
  xp_next: number;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  custom_label?: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  months: number;
  required_monthly: number;
  priority: number;
  status: 'active' | 'completed' | 'archived';
  category_color?: string;
  bank?: string;
}

export interface SavingsPlan {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  duration_months: number;
  bank: string;
  status: 'active' | 'completed';
  created_at: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  template_code: string;
  title: string;
  description: string;
  category: 'saving' | 'transaction' | 'card' | 'digital';
  current_progress: number;
  target_progress: number;
  unit: string;
  xp_reward: number;
  points_reward: number;
  status: 'active' | 'completed' | 'claimed';
  is_first_mission?: boolean;
  generated_from?: {
    reason: string;
    source: string;
    goal_name?: string;
  };
}

export interface Account {
  id: string;
  type: 'savings' | 'current' | 'flex';
  name: string;
  balance: number;
  account_number: string;
  card_last4?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  action_type: 'funding' | 'transfer' | 'bill_payment' | 'airtime' | 'saving_transfer' | 'money_received';
  title: string;
  subtitle: string;
  amount: number;
  timestamp: string;
  status: 'successful' | 'pending' | 'failed';
  is_simulated: boolean;
  account_type: 'savings' | 'current' | 'flex';
  reference: string;
  beneficiary?: string;
  category_icon?: string;
}

export interface ProfileExplanation {
  customer_segment: string[];
  savings_profile: string[];
  financial_tier: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  occupation: Occupation;
  income_stability: IncomeStability;
  active_accounts_count: number;
  has_emergency_savings: boolean;
  monthly_target: number;
  customer_segment: CustomerSegment;
  customer_segment_name: string;
  financial_tier: FinancialTier;
  financial_score: number;
  savings_profile: SavingsProfile;
  savings_profile_name: string;
  digital_usage: DigitalUsage;
  explanation: ProfileExplanation;
  level: LevelInfo;
  xp: number;
  reward_points: number;
  has_completed_onboarding: boolean;
  streak_days: number;
}

export interface ProfileHistoryItem {
  id: string;
  field: string;
  field_label: string;
  old_value: string;
  new_value: string;
  source: 'onboarding' | 'user_update' | 'behaviour';
  reason: string[];
  created_at: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  category: 'airtime' | 'voucher' | 'perk' | 'merch';
  value_display: string;
  code?: string;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  reward_title: string;
  points_spent: number;
  timestamp: string;
  status: 'completed';
  code: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_name: 'leaf' | 'bill' | 'bolt' | 'piggy' | 'flame' | 'crown';
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
}

export interface OnboardingFormValues {
  occupation: Occupation | '';
  income_stability: IncomeStability | '';
  monthly_target: number;
  active_accounts: number;
  has_emergency_savings: boolean | null;
  goals: {
    category: GoalCategory | '';
    custom_label?: string;
    target_amount: number;
    months: number;
    current_amount?: number;
    bank?: string;
  }[];
}
