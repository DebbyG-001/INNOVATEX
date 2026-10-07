import React from 'react';
import { AccountCards } from '../dashboard/AccountCards';
import { AchievementsGrid } from '../dashboard/AchievementsGrid';
import { ChallengesPanel } from '../dashboard/ChallengesPanel';
import { GoalsPanel } from '../dashboard/GoalsPanel';
import { HeroBanner } from '../dashboard/HeroBanner';
import { PointsCard } from '../dashboard/PointsCard';
import { QuickActions } from '../dashboard/QuickActions';
import { RecentTransactions } from '../dashboard/RecentTransactions';
import { BottomBanner, RewardsBanner } from '../dashboard/RewardsBanner';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Balance & Level Banner */}
      <HeroBanner />

      {/* 2. Account Cards (Savings, Current, Flex, My Cards) */}
      <AccountCards />

      {/* 3. Quick Actions Row */}
      <QuickActions />

      {/* 4. Two-Column Content & Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Transactions & Goals) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <RecentTransactions />
          <GoalsPanel />
        </div>

        {/* Right Rail (Points, Achievements, Challenges, Rewards) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <PointsCard />
          <AchievementsGrid />
          <ChallengesPanel />
          <RewardsBanner />
        </div>
      </div>

      {/* 5. Bottom Motivational Banner */}
      <BottomBanner />
    </div>
  );
};
