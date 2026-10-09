import React, { useEffect, useState } from 'react';

export const WelcomeAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'initial' | 'fade-in' | 'fade-out'>('initial');

  useEffect(() => {
    // Start fade-in shortly after mount
    const t1 = setTimeout(() => setStage('fade-in'), 100);
    // Start fade-out
    const t2 = setTimeout(() => setStage('fade-out'), 2000);
    // Unmount
    const t3 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#071A3F] transition-opacity duration-500 ease-in-out ${
        stage === 'fade-out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div 
        className={`flex flex-col items-center justify-center transition-all duration-1000 ease-out transform ${
          stage === 'initial' ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Premium Logo Rendering */}
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-[#22C55E] rounded-3xl rotate-45 opacity-20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0047AB] to-[#22C55E] rounded-3xl rotate-45 flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 bg-white rounded-xl -rotate-45 flex items-center justify-center shadow-inner">
               <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#0047AB]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
               </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Eco<span className="text-[#22C55E]">Quest</span>
        </h1>
        <p className="text-[#8B9BB4] text-sm font-medium tracking-wide">
          Empowering your financial journey
        </p>
      </div>
    </div>
  );
};
