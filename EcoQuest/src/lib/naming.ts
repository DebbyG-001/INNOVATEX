/**
 * EcoQuest terminology mapping:
 * UI displays "Challenges"; internal engine and API data models refer to "missions".
 */
export const TERMINOLOGY = {
  missionSingularUI: 'Challenge',
  missionPluralUI: 'Challenges',
  missionActiveLabel: 'Active Challenges',
  missionCompletedLabel: 'Completed Challenges',
  missionSingularAPI: 'mission',
  missionPluralAPI: 'missions',
  pointsLabel: 'Reward Points',
  xpLabel: 'XP',
} as const;
