import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Gift,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../lib/formatters';

export const ChallengesView: React.FC = () => {
  const { missions, claimMissionReward, activeMissionNotice, openModal } = useApp();
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const activeMissions = missions.filter((m) => m.status === 'active' || m.status === 'completed');
  const claimedMissions = missions.filter((m) => m.status === 'claimed');

  const displayedList = tab === 'active' ? activeMissions : claimedMissions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Gamified Challenges</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Complete daily and weekly financial milestones to earn XP and Points
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] border border-[#E3E9F4] rounded-2xl w-fit">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'active'
                ? 'bg-white text-[#0047AB] shadow-xs'
                : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
            }`}
          >
            Active ({activeMissions.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'completed'
                ? 'bg-white text-[#15803D] shadow-xs'
                : 'text-[#5B6B8C] hover:text-[#0B1B3A]'
            }`}
          >
            Claimed ({claimedMissions.length})
          </button>
        </div>
      </div>

      {/* Notice Banner when > 3 active missions per specification */}
      {activeMissionNotice && tab === 'active' && (
        <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-[#0047AB]/30 flex items-start gap-3 text-xs text-[#0047AB]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#0047AB]" />
          <div>
            <h4 className="font-extrabold text-sm">
              Multiple Active Challenges ({activeMissionNotice.count})
            </h4>
            <p className="text-[#5B6B8C] mt-1 leading-relaxed">
              {activeMissionNotice.reason} All active challenges remain available and continue
              tracking your banking activity simultaneously.
            </p>
          </div>
        </div>
      )}

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedList.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-[#E3E9F4] p-6 text-xs text-[#5B6B8C]">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-[#5B6B8C]/40" />
            No challenges in this category right now.
          </div>
        ) : (
          displayedList.map((m) => {
            const isFinished = m.current_progress >= m.target_progress;
            const percent = Math.min(
              100,
              Math.round((m.current_progress / m.target_progress) * 100)
            );

            return (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-[#E3E9F4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-[#0047AB] flex items-center justify-center shrink-0 border border-[#0047AB]/20">
                        {m.category === 'saving' ? (
                          <Gift className="w-6 h-6 text-[#F59E0B]" />
                        ) : (
                          <Trophy className="w-6 h-6 text-[#0047AB]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0B1B3A]">{m.title}</h3>
                        <p className="text-[11px] text-[#5B6B8C] mt-0.5 leading-snug">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FEF3C7] text-[#D97706] text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                        <span>+{m.points_reward} pts</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#0047AB]">
                        +{m.xp_reward} XP
                      </span>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                      <span className="text-[#0B1B3A]">
                        {m.unit === '₦'
                          ? formatNaira(m.current_progress, true)
                          : `${m.current_progress} ${m.unit}`}
                      </span>
                      <span className="text-[#5B6B8C]">
                        {m.unit === '₦'
                          ? formatNaira(m.target_progress, true)
                          : `${m.target_progress} ${m.unit}`}
                      </span>
                    </div>

                    <div
                      className="w-full h-2 bg-[#E3E9F4] rounded-full overflow-hidden"
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
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[#E3E9F4]">
                  {m.status === 'completed' ? (
                    <button
                      onClick={() => claimMissionReward(m.id)}
                      className="w-full py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Claim +{m.points_reward} Points & +{m.xp_reward} XP!</span>
                    </button>
                  ) : m.status === 'claimed' ? (
                    <div className="py-2 bg-[#DCFCE7] text-[#15803D] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#5B6B8C]">
                      <span>In progress ({percent}%)</span>
                      {m.category === 'saving' && (
                        <button
                          onClick={() => openModal('save_money')}
                          className="text-[#0047AB] font-bold hover:underline cursor-pointer"
                        >
                          Save money →
                        </button>
                      )}
                      {m.category === 'transaction' && (
                        <button
                          onClick={() => openModal('transfer')}
                          className="text-[#0047AB] font-bold hover:underline cursor-pointer"
                        >
                          Transact →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
