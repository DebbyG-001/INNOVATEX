import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Gift,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const ChallengesPanel: React.FC = () => {
  const { missions, claimMissionReward, activeMissionNotice, setActiveTab } = useApp();

  const activeMissions = missions.filter((m) => m.status !== 'claimed');

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3E9F4] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#0047AB]" />
          <h3 className="font-extrabold text-sm text-[#0B1B3A]">Active Challenges</h3>
        </div>
        <button
          onClick={() => setActiveTab('challenges')}
          className="text-xs font-semibold text-[#0047AB] hover:underline cursor-pointer"
        >
          See all
        </button>
      </div>

      {/* Notice Banner when > 3 active missions per specification */}
      {activeMissionNotice && (
        <div className="mb-4 p-3 rounded-xl bg-[#EAF1FF] border border-[#0047AB]/20 flex items-start gap-2.5 text-xs text-[#0047AB]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Multiple Active Challenges ({activeMissionNotice.count})</p>
            <p className="text-[#5B6B8C] mt-0.5 text-[11px] leading-relaxed">
              {activeMissionNotice.reason}
            </p>
          </div>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-3">
        {activeMissions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#5B6B8C]">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#22C55E]" />
            All current challenges completed! Check back soon.
          </div>
        ) : (
          activeMissions.slice(0, 3).map((mission) => {
            const isFinished = mission.current_progress >= mission.target_progress;
            const percent = Math.min(
              100,
              Math.round((mission.current_progress / mission.target_progress) * 100)
            );

            return (
              <div
                key={mission.id}
                className="p-3.5 rounded-xl border border-[#E3E9F4] bg-[#F4F7FC]/50 hover:bg-[#F4F7FC] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Category icon */}
                    <div className="w-8 h-8 rounded-lg bg-[#EAF1FF] border border-[#0047AB]/20 flex items-center justify-center text-[#0047AB] shrink-0">
                      {mission.category === 'saving' ? (
                        <Gift className="w-4 h-4 text-[#F59E0B]" />
                      ) : (
                        <Trophy className="w-4 h-4 text-[#0047AB]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1B3A] leading-tight">
                        {mission.title}
                      </h4>
                      <p className="text-[11px] font-mono tabular-nums text-[#5B6B8C] mt-0.5">
                        {mission.unit === '₦' ? (
                          <>
                            {formatNaira(mission.current_progress, true)} /{' '}
                            {formatNaira(mission.target_progress, true)}
                          </>
                        ) : (
                          <>
                            {mission.current_progress} / {mission.target_progress} {mission.unit}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Points Reward Tag */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold shrink-0">
                    <Star className="w-3 h-3 fill-[#D97706]" />
                    <span>+{mission.points_reward} pts</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="w-full h-1.5 bg-[#E3E9F4] rounded-full mt-3 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#0047AB] to-[#22C55E] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Claim reward button if completed */}
                {isFinished && mission.status === 'completed' && (
                  <button
                    onClick={() => claimMissionReward(mission.id)}
                    className="mt-2.5 w-full py-1.5 px-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claim +{mission.points_reward} Points!</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
