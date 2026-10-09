'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  Star,
  Target,
  Trophy,
  User,
  Wallet,
  X,
  BookOpen,
} from 'lucide-react';
import { LandingPage } from './components/auth/LandingPage';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ModalRoot } from './components/modals/ModalRoot';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AccountsView } from './components/views/AccountsView';
import { AchievementsView } from './components/views/AchievementsView';
import { ProfileView } from './components/views/ProfileView';
import { RewardsView } from './components/views/RewardsView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionsView } from './components/views/TransactionsView';
import { DashboardView } from './components/views/DashboardView';
import { GoalsView } from './components/views/GoalsView';
import { AjoView } from './components/views/AjoView';
import { BudgetView } from './components/views/BudgetView';
import { FinancialIQView } from './components/views/FinancialIQView';
import { UtilitiesView } from './components/views/UtilitiesView';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeAnimation } from './components/WelcomeAnimation';

const ToastManager = () => {
  const { toast } = useApp();
  
  if (!toast) return null;

  const bgColors = {
    success: 'bg-[#22C55E]',
    error: 'bg-[#EF4444]',
    info: 'bg-[#0047AB]',
    reward: 'bg-[#9333EA]',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${bgColors[toast.type]} text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2`}>
        {toast.type === 'reward' && '🎉'}
        {toast.type === 'success' && '✅'}
        {toast.message}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab, setActiveTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !hasShownWelcome) {
      setShowWelcome(true);
      setHasShownWelcome(true);
    }
  }, [isAuthenticated, hasShownWelcome]);

  // Authentication & Entry Flow
  // Requirement 3: Landing Page → Create Account → Onboarding → Dashboard
  if (!isAuthenticated && activeTab !== 'register' && activeTab !== 'login') {
    return <LandingPage />;
  }

  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  if (activeTab === 'register') {
    return <RegisterScreen />;
  }

  if (activeTab === 'login') {
    return <LoginScreen />;
  }

  // If in Onboarding flow, display full onboarding wizard
  if (activeTab === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F4F7FC]">
        <OnboardingWizard />
        <ModalRoot />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'accounts':
        return <AccountsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'goals':
        return <GoalsView />;
      case 'challenges': // Keep fallback
      case 'learn':
        return <FinancialIQView />;
      case 'ajo':
        return <AjoView />;
      case 'budget':
        return <BudgetView />;
      case 'utilities':
        return <UtilitiesView />;
      case 'rewards':
        return <RewardsView />;
      case 'profile':
        return <ProfileView />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#0B1B3A] flex flex-col lg:flex-row antialiased">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar with mobile hamburger button - Sticky */}
        <div className="sticky top-0 z-30 bg-[#F4F7FC]/90 backdrop-blur-md flex items-center border-b border-[#E3E9F4] shadow-sm">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-4 text-[#071A3F] hover:bg-[#EAF1FF] transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <Topbar />
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible below lg) */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E3E9F4] py-2 px-3 flex items-center justify-around z-20 lg:hidden"
        aria-label="Mobile navigation"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-[#0047AB]' : 'text-[#5B6B8C]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'accounts' ? 'text-[#0047AB]' : 'text-[#5B6B8C]'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'goals' ? 'text-[#0047AB]' : 'text-[#5B6B8C]'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'learn' ? 'text-[#0047AB]' : 'text-[#5B6B8C]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Learn</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'profile' ? 'text-[#0047AB]' : 'text-[#5B6B8C]'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Global Modals */}
      <ModalRoot />
      <ToastManager />
      
      {showWelcome && <WelcomeAnimation onComplete={() => setShowWelcome(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
