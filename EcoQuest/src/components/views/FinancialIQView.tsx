import React from 'react';
import { BookOpen, CheckCircle, Lock, PlayCircle, Star, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MODULES = [
  {
    id: 'm1',
    title: 'The Power of Compounding',
    description: 'Learn how your money makes money over time.',
    xpReward: 50,
    status: 'completed',
    duration: '5 mins',
  },
  {
    id: 'm2',
    title: 'Emergency Funds 101',
    description: 'Why you need a buffer and how to build it.',
    xpReward: 75,
    status: 'active',
    duration: '8 mins',
  },
  {
    id: 'm3',
    title: 'Navigating Ajo Systems',
    description: 'Group savings dynamics and best practices.',
    xpReward: 100,
    status: 'locked',
    duration: '10 mins',
  },
];

export const FinancialIQView: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1B3A]">Financial IQ</h2>
          <p className="text-xs text-[#5B6B8C] mt-0.5">
            Level up your money knowledge and earn XP
          </p>
        </div>
        <div className="bg-[#EAF1FF] text-[#0047AB] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span>Level {user.level.index} Scholar</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#9333EA] to-[#A855F7] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-300" />
              Daily Knowledge Quest
            </h3>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Complete today's 5-minute lesson to earn +50 XP and a streak bonus!
              Building wealth starts with building knowledge.
            </p>
          </div>
          <button className="shrink-0 w-full md:w-auto px-6 py-3 bg-white text-[#9333EA] hover:bg-gray-50 rounded-xl font-bold transition-colors shadow-sm">
            Start Lesson
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#0B1B3A] mb-4 uppercase tracking-wider">
          Curriculum Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod) => (
            <div
              key={mod.id}
              className={`rounded-2xl p-5 border shadow-sm transition-all ${
                mod.status === 'locked'
                  ? 'bg-gray-50 border-gray-100 opacity-75'
                  : 'bg-white border-[#E3E9F4] hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mod.status === 'completed'
                      ? 'bg-[#22C55E]/10 text-[#22C55E]'
                      : mod.status === 'active'
                      ? 'bg-[#0047AB]/10 text-[#0047AB]'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {mod.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : mod.status === 'locked' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#F4F7FC] px-2 py-1 rounded text-[10px] font-bold text-[#0047AB]">
                  <span>+{mod.xpReward} XP</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#0B1B3A] mb-1 leading-snug">
                {mod.title}
              </h4>
              <p className="text-xs text-[#5B6B8C] line-clamp-2">
                {mod.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#E3E9F4] flex items-center justify-between text-xs font-semibold">
                <span className="text-[#5B6B8C]">{mod.duration}</span>
                {mod.status === 'completed' && (
                  <span className="text-[#22C55E]">Completed</span>
                )}
                {mod.status === 'active' && (
                  <span className="text-[#0047AB] hover:underline">Start now →</span>
                )}
                {mod.status === 'locked' && (
                  <span className="text-gray-400">Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
