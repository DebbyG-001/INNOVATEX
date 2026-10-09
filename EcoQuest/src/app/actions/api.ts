'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { toKobo } from '@/lib/money';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        redirect('/login');
      }
    }

    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: any) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Field';
          return `${field}: ${err.msg}`;
        }).join(', ');
      } else {
        errorMessage = errorData.detail || errorMessage;
      }
    } catch {
      // Ignore JSON parse error
    }

    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
      return { _isAuthError: true, message: errorMessage, status: response.status };
    }

    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Auth
export const login = async (data: any) => fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = async (data: any) => fetchWithAuth('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const logout = async () => fetchWithAuth('/api/auth/logout', { method: 'POST' });

// User
export const getMe = async () => fetchWithAuth('/api/users/me');

// Onboarding
export const submitOnboarding = async (data: any) => {
  const payload = { ...data, monthly_target: toKobo(data.monthly_target) };
  if (payload.goals) {
    payload.goals = payload.goals.map((g: any) => ({ ...g, target_amount: toKobo(g.target_amount), current_amount: toKobo(g.current_amount) }));
  }
  return fetchWithAuth('/api/onboarding/submit', { method: 'POST', body: JSON.stringify(payload) });
};

// Accounts
export const getAccounts = async () => fetchWithAuth('/api/accounts');
export const getAccount = async (id: number | string) => fetchWithAuth(`/api/accounts/${id}`);
export const addFunds = async (data: any) => fetchWithAuth('/api/accounts/funds', { method: 'POST', body: JSON.stringify({ ...data, amount: toKobo(data.amount) }) });

// Transactions
export const getTransactions = async () => fetchWithAuth('/api/transactions');
export const createTransaction = async (data: any) => fetchWithAuth('/api/transactions', { method: 'POST', body: JSON.stringify({ ...data, amount: toKobo(data.amount) }) });

// Bills
export const getBills = async () => fetchWithAuth('/bills/');
export const createBill = async (data: any) => fetchWithAuth('/bills/', { method: 'POST', body: JSON.stringify({ ...data, amount: toKobo(data.amount) }) });
export const payBill = async (id: number | string) => fetchWithAuth(`/bills/${id}/pay`, { method: 'POST' });

// Goals
export const getGoals = async () => fetchWithAuth('/api/goals');
export const createGoal = async (data: any) => fetchWithAuth('/api/goals', { method: 'POST', body: JSON.stringify({ ...data, target_amount: toKobo(data.target_amount), current_amount: toKobo(data.current_amount), required_monthly: toKobo(data.required_monthly) }) });
export const updateGoal = async (id: number | string, data: any) => fetchWithAuth(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify({ ...data, amount_to_add: data.amount_to_add ? toKobo(data.amount_to_add) : undefined }) });
export const deleteGoal = async (id: number | string) => fetchWithAuth(`/api/goals/${id}`, { method: 'DELETE' });

// Savings
export const getSavingsPlans = async () => fetchWithAuth('/api/savings');
export const createSavingsPlan = async (data: any) => fetchWithAuth('/api/savings', { method: 'POST', body: JSON.stringify({ ...data, target_amount: toKobo(data.target_amount) }) });
export const updateSavingsPlan = async (id: number | string, data: any) => fetchWithAuth(`/api/savings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSavingsPlan = async (id: number | string) => fetchWithAuth(`/api/savings/${id}`, { method: 'DELETE' });

// Gamification
export const getXP = async () => fetchWithAuth('/api/gamification/xp');
export const getAchievements = async () => fetchWithAuth('/api/gamification/achievements');
export const completeAchievement = async (id: number | string) => fetchWithAuth(`/api/gamification/achievements/${id}/complete`, { method: 'POST' });
export const getMissions = async () => fetchWithAuth('/api/gamification/missions');
export const claimMission = async (id: number | string) => fetchWithAuth(`/api/gamification/missions/${id}/claim`, { method: 'POST' });
export const getRewards = async () => fetchWithAuth('/api/gamification/rewards');
export const redeemReward = async (id: number | string) => fetchWithAuth(`/api/gamification/rewards/${id}/redeem`, { method: 'POST' });

// Budgets
export const getBudgets = async () => fetchWithAuth('/api/budgets/');
export const createBudget = async (data: any) => fetchWithAuth('/api/budgets/', { method: 'POST', body: JSON.stringify({ ...data, limit_amount: toKobo(data.limit_amount) }) });
