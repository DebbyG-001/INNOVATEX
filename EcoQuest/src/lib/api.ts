export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
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
      // Ignore JSON parse error for error responses
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Auth
  login: (data: any) => fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchWithAuth('/api/auth/logout', { method: 'POST' }),

  // User
  getMe: () => fetchWithAuth('/api/users/me'),

  // Onboarding
  submitOnboarding: (data: any) => fetchWithAuth('/api/onboarding/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Accounts
  getAccounts: () => fetchWithAuth('/api/accounts'),
  getAccount: (id: number | string) => fetchWithAuth(`/api/accounts/${id}`),
  addFunds: (data: any) => fetchWithAuth('/api/accounts/funds', { method: 'POST', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: () => fetchWithAuth('/api/transactions'),
  createTransaction: (data: any) => fetchWithAuth('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),

  // Goals
  getGoals: () => fetchWithAuth('/api/goals'),
  createGoal: (data: any) => fetchWithAuth('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: number | string, data: any) => fetchWithAuth(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id: number | string) => fetchWithAuth(`/api/goals/${id}`, { method: 'DELETE' }),

  // Savings
  getSavingsPlans: () => fetchWithAuth('/api/savings'),
  createSavingsPlan: (data: any) => fetchWithAuth('/api/savings', { method: 'POST', body: JSON.stringify(data) }),
  updateSavingsPlan: (id: number | string, data: any) => fetchWithAuth(`/api/savings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSavingsPlan: (id: number | string) => fetchWithAuth(`/api/savings/${id}`, { method: 'DELETE' }),

  // Gamification
  getXP: () => fetchWithAuth('/api/gamification/xp'),
  getAchievements: () => fetchWithAuth('/api/gamification/achievements'),
  completeAchievement: (id: number | string) => fetchWithAuth(`/api/gamification/achievements/${id}/complete`, { method: 'POST' }),
  getMissions: () => fetchWithAuth('/api/gamification/missions'),
  claimMission: (id: number | string) => fetchWithAuth(`/api/gamification/missions/${id}/claim`, { method: 'POST' }),
  getRewards: () => fetchWithAuth('/api/gamification/rewards'),
  redeemReward: (id: number | string) => fetchWithAuth(`/api/gamification/rewards/${id}/redeem`, { method: 'POST' }),
};
