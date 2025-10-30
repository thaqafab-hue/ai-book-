
import React, { useState } from 'react';
import Header from './components/Header';
import AnimatedBackground from './components/AnimatedBackground';
import ExamGenerator from './components/features/ExamGenerator';
import LessonExplainer from './components/features/LessonExplainer';
import ProjectCreator from './components/features/ProjectCreator';
import ChatBot from './components/ChatBot';
import { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('exam');

  const renderPage = () => {
    switch (activePage) {
      case 'exam':
        return <ExamGenerator key="exam" />;
      case 'lesson':
        return <LessonExplainer key="lesson" />;
      case 'project':
        return <ProjectCreator key="project" />;
      default:
        return <ExamGenerator key="exam" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
        <ChatBot />
      </div>
    </div>
  );
};

export default App;
