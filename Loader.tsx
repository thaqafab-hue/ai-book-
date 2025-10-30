import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "جاري الإنشاء..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-slate-500/30"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-slate-400 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-slate-500/10 animate-pulse"></div>
      </div>
      <p className="font-orbitron text-slate-300 tracking-widest animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;
