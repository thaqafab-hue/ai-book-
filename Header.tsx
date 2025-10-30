import React from 'react';
import { Page } from '../types';
import { BookOpenIcon, FlaskIcon, BriefcaseIcon, AIBookLogoIcon } from './Icons';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'exam', label: 'مولد الاختبارات', icon: <BookOpenIcon /> },
    { id: 'lesson', label: 'شرح الدروس', icon: <FlaskIcon /> },
    { id: 'project', label: 'منشئ المشاريع', icon: <BriefcaseIcon /> },
  ];

  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-slate-500/20 shadow-lg shadow-slate-500/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <AIBookLogoIcon />
            <h1 className="font-orbitron text-2xl font-bold text-white tracking-wider">AI Book</h1>
          </div>
          <nav className="hidden md:flex space-x-4 rtl:space-x-reverse">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105
                  ${activePage === item.id 
                    ? 'bg-slate-600/50 text-slate-100 shadow-md ring-1 ring-slate-400/50' 
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="md:hidden flex justify-around p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-md text-xs font-medium transition-all duration-300
                  ${activePage === item.id 
                    ? 'bg-slate-600/50 text-slate-200' 
                    : 'text-gray-400 hover:bg-slate-700/50'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
