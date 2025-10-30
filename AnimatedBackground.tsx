import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-neutral-900 animate-gradient-xy"></div>
      <div className="absolute -bottom-1/2 -left-1/4 w-full h-full rounded-full bg-gradient-to-r from-slate-500/10 to-transparent animate-pulse-slow"></div>
      <div className="absolute -top-1/2 -right-1/4 w-3/4 h-3/4 rounded-full bg-gradient-to-l from-neutral-500/10 to-transparent animate-pulse-medium"></div>
      <style>{`
        @keyframes gradient-xy {
            0%, 100% {
                background-size: 400% 400%;
                background-position: 0% 50%;
            }
            50% {
                background-size: 200% 200%;
                background-position: 100% 50%;
            }
        }
        .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 10s ease-in-out infinite;
        }
        @keyframes pulse-medium {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.03); }
        }
        .animate-pulse-medium {
            animation: pulse-medium 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
