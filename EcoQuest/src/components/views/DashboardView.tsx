import React from 'react';
import { ChallengesPanel } from '../dashboard/ChallengesPanel';
import { HeroBanner } from '../dashboard/HeroBanner';
import { BottomBanner } from '../dashboard/RewardsBanner';
import {
  UpcomingBillsWidget,
  AjoProgressWidget,
  FinancialIQWidget,
  BudgetHealthWidget
} from '../dashboard/DashboardWidgets';
import { QuickActions } from '../dashboard/QuickActions';
import { RecentTransactions } from '../dashboard/RecentTransactions';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Welcome -> Level + XP -> Savings -> Savings Streak */}
      <HeroBanner />

      {/* Restored Quick Actions */}
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {/* Next Mission */}
        <div className="space-y-6">
          <ChallengesPanel />
        </div>

        {/* Upcoming Bills & Budget Health */}
        <div className="space-y-6">
          <UpcomingBillsWidget />
          <BudgetHealthWidget />
        </div>

        {/* Ajo Progress & Financial IQ */}
        <div className="space-y-6">
          <AjoProgressWidget />
          <FinancialIQWidget />
          <RecentTransactions limit={3} />
        </div>
      </div>

      {/* Motivational Banner */}
      <BottomBanner />
    </div>
  );
};
