import {
  CustomerSegment,
  FinancialTier,
  Goal,
  GoalCategory,
  IncomeStability,
  LevelInfo,
  LevelName,
  Mission,
  Occupation,
  ProfileExplanation,
  SavingsProfile,
  UserProfile,
} from '../types';

export const XP_THRESHOLDS: { name: string; code: LevelName; min: number; next: number }[] = [
  { name: 'Starter', code: 'starter', min: 0, next: 500 },
  { name: 'Builder', code: 'builder', min: 500, next: 1500 },
  { name: 'Achiever', code: 'achiever', min: 1500, next: 3500 },
  { name: 'Champion', code: 'champion', min: 3500, next: 7000 },
  { name: 'Master', code: 'master', min: 7000, next: 10000 },
];

export function calculateLevel(xp: number): LevelInfo {
  let index = 1;
  let currentLevel = XP_THRESHOLDS[0];

  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i].min) {
      currentLevel = XP_THRESHOLDS[i];
      index = i + 1;
      break;
    }
  }

  return {
    index,
    name: currentLevel.name,
    code: currentLevel.code,
    xp,
    xp_floor: currentLevel.min,
    xp_next: currentLevel.next,
  };
}

export function determineSegment(
  occupation: Occupation,
  primaryGoalName?: string
): { segment: CustomerSegment; name: string; reasons: string[] } {
  const reasons: string[] = [];

  switch (occupation) {
    case 'student':
      reasons.push("You're currently a student building financial habits");
      if (primaryGoalName) {
        reasons.push(`Your primary goal is ${primaryGoalName}`);
      } else {
        reasons.push('Focusing on education and early savings milestones');
      }
      return { segment: 'student_saver', name: 'Student Saver', reasons };

    case 'salaried':
    case 'civil_servant':
      reasons.push(
        occupation === 'civil_servant'
          ? 'You work in public service with predictable structured pay'
          : 'You earn a regular salary with recurring pay cycles'
      );
      reasons.push('Optimized for structured paycheck allocations and automated goals');
      return { segment: 'salary_earner', name: 'Salary Earner', reasons };

    case 'business_owner':
      reasons.push('You manage commercial operations and business cash flows');
      reasons.push('Tailored for separating business income and building business reserves');
      return { segment: 'business_builder', name: 'Business Builder', reasons };

    case 'freelancer':
      reasons.push('You earn project-based and variable contract income');
      reasons.push('Designed for variable cash flow buffers and flexible savings pacing');
      return { segment: 'independent_earner', name: 'Independent Earner', reasons };

    case 'other':
    default:
      reasons.push('Flexible saver profile adapted to your personal workflow');
      reasons.push('Adaptive savings tracking tuned to custom target schedules');
      return { segment: 'flexible_saver', name: 'Flexible Saver', reasons };
  }
}

export function determineFinancialTier(
  monthlyTarget: number,
  incomeStability: IncomeStability,
  activeAccounts: number
): { tier: FinancialTier; score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (monthlyTarget >= 100000) {
    score += 2;
    reasons.push(`Monthly target of ₦${monthlyTarget.toLocaleString()} meets Tier-2 threshold (+2)`);
  } else if (monthlyTarget >= 30000) {
    score += 1;
    reasons.push(`Monthly target of ₦${monthlyTarget.toLocaleString()} meets baseline threshold (+1)`);
  } else {
    reasons.push(`Monthly target of ₦${monthlyTarget.toLocaleString()} establishes a manageable baseline (+0)`);
  }

  if (incomeStability === 'stable') {
    score += 1;
    reasons.push('Income stability: Stable income stream (+1)');
  } else if (incomeStability === 'variable') {
    reasons.push('Income stability: Variable cash inflow (+0)');
  } else {
    reasons.push('Income stability: Irregular cash flow buffer (+0)');
  }

  if (activeAccounts >= 2) {
    score += 1;
    reasons.push(`${activeAccounts} active bank accounts utilized (+1)`);
  } else {
    reasons.push(`${activeAccounts} active bank account configured (+0)`);
  }

  let tier: FinancialTier = 'essentials';
  if (score >= 4) {
    tier = 'prime';
  } else if (score >= 2) {
    tier = 'plus';
  } else {
    tier = 'essentials';
  }

  return { tier, score, reasons };
}

export function determineSavingsProfile(
  occupation: Occupation,
  goals: { category: GoalCategory; name?: string }[],
  hasEmergencySavings: boolean,
  digitalUsage: 'none' | 'low' | 'moderate' | 'high' = 'none'
): { profile: SavingsProfile; name: string; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Money Learner: occupation == student && any goal has education
  const hasEducationGoal = goals.some((g) => g.category === 'education');
  if (occupation === 'student' && hasEducationGoal) {
    reasons.push('You selected an education-related goal as a student');
    reasons.push("You're starting your foundational financial growth journey");
    return { profile: 'money_learner', name: 'Money Learner', reasons };
  }

  // 2. Buffer Builder: any emergency goal or no emergency savings
  const hasEmergencyGoal = goals.some((g) => g.category === 'emergency_fund');
  if (hasEmergencyGoal || !hasEmergencySavings) {
    if (!hasEmergencySavings) {
      reasons.push('You indicated you do not currently have an emergency safety net');
    }
    if (hasEmergencyGoal) {
      reasons.push('You prioritized building an Emergency Fund goal');
    }
    reasons.push('Prioritizing a foundational liquidity cushion before speculative allocations');
    return { profile: 'buffer_builder', name: 'Buffer Builder', reasons };
  }

  // 3. Digital Starter: low or none digital banking events
  if (digitalUsage === 'none' || digitalUsage === 'low') {
    reasons.push('Digital payment activity derived from initial events indicates early digital adoption');
    reasons.push('Designed to build confidence with digital transfers, bill payments, and smart savings');
    return { profile: 'digital_starter', name: 'Digital Starter', reasons };
  }

  // 4. Streak Saver: default
  reasons.push('Consistent recurring savings discipline identified');
  reasons.push('Focused on weekly deposit streaks and milestone compounding');
  return { profile: 'streak_saver', name: 'Streak Saver', reasons };
}

export function calculateRequiredMonthly(
  targetAmount: number,
  currentAmount: number,
  months: number
): number {
  const safeMonths = Math.max(1, Math.round(months));
  const remaining = Math.max(0, targetAmount - currentAmount);
  return Math.ceil(remaining / safeMonths);
}

export function generateFirstMission(
  segment: CustomerSegment,
  profile: SavingsProfile,
  primaryGoal?: { name: string; target_amount: number; category: GoalCategory }
): Mission {
  if (segment === 'student_saver' && profile === 'money_learner') {
    const goalTitle = primaryGoal?.name || 'University Essentials';
    return {
      id: 'm-first-student',
      template_code: 'BUILD_UNIVERSITY_FUND',
      title: `Build Your ${goalTitle} Fund`,
      description: `Save your first ₦${Math.min(
        10000,
        Math.round((primaryGoal?.target_amount || 50000) * 0.1)
      ).toLocaleString()} toward your ${goalTitle} goal to kickstart your academic buffer.`,
      category: 'saving',
      current_progress: 0,
      target_progress: Math.min(10000, Math.round((primaryGoal?.target_amount || 50000) * 0.1)),
      unit: '₦',
      xp_reward: 200,
      points_reward: 250,
      status: 'active',
      is_first_mission: true,
      generated_from: {
        reason: 'Recommended for your Student Saver & Money Learner profile',
        source: 'onboarding',
        goal_name: goalTitle,
      },
    };
  }

  if (profile === 'buffer_builder') {
    const target = primaryGoal?.target_amount || 50000;
    const initialTarget = Math.min(15000, Math.round(target * 0.2));
    return {
      id: 'm-first-buffer',
      template_code: 'BUILD_EMERGENCY_BUFFER',
      title: `Build Your ₦${target.toLocaleString()} Emergency Buffer`,
      description: `Transfer your first ₦${initialTarget.toLocaleString()} into your emergency savings pot to secure your rainy-day cushion.`,
      category: 'saving',
      current_progress: 0,
      target_progress: initialTarget,
      unit: '₦',
      xp_reward: 250,
      points_reward: 300,
      status: 'active',
      is_first_mission: true,
      generated_from: {
        reason: 'Matched to your Buffer Builder profile to establish emergency liquidity',
        source: 'onboarding',
        goal_name: primaryGoal?.name || 'Emergency Fund',
      },
    };
  }

  if (profile === 'digital_starter') {
    return {
      id: 'm-first-digital',
      template_code: 'FIRST_DIGITAL_PAYMENT',
      title: 'Make Your First Digital Payment',
      description: 'Complete 1 simulated bill payment or airtime purchase to activate your digital banking track.',
      category: 'digital',
      current_progress: 0,
      target_progress: 1,
      unit: 'payment',
      xp_reward: 150,
      points_reward: 200,
      status: 'active',
      is_first_mission: true,
      generated_from: {
        reason: 'Tailored for Digital Starter to experience seamless mobile transactions',
        source: 'onboarding',
      },
    };
  }

  // Default Streak Saver
  return {
    id: 'm-first-streak',
    template_code: 'STREAK_START_WEEK_1',
    title: 'Save Every Week for 4 Weeks',
    description: 'Complete your first weekly automated or manual save to ignite your 4-week streak flame.',
    category: 'saving',
    current_progress: 0,
    target_progress: 4,
    unit: 'weeks',
    xp_reward: 300,
    points_reward: 350,
    status: 'active',
    is_first_mission: true,
    generated_from: {
      reason: 'Assigned to your Streak Saver profile to reward consistent saving discipline',
      source: 'onboarding',
    },
  };
}
